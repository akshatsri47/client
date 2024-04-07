import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient, AptosAccount, Types } from "aptos";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const MODULE_ADDRESS = "0x9776af850a2fa2e2e55753ba2ed7a7bbb8b1addc8b50d89b89c7ef6394301cc4";

const client = new AptosClient(NODE_URL);

async function submitTransaction(account: AptosAccount, payload: Types.EntryFunctionPayload) {
  try {
    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const txnResponse = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(txnResponse.hash);
    return txnResponse;
  } catch (error) {
    console.error("Transaction submission error:", error);
    throw error;
  }
}
async function registerPatient(account: AptosAccount, name: string, age: number, condition: string) {
  const payload: Types.EntryFunctionPayload = {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::PatientHospitalVerification::register_patient`,
    arguments: [name, age, condition],
    type_arguments: [],
  };
  return await submitTransaction(account, payload);
}

async function verifyPatient(account: AptosAccount, patientAddress: string) {
  const payload: Types.EntryFunctionPayload = {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::PatientHospitalVerification::verify_patient`,
    arguments: [patientAddress],
    type_arguments: [],
  };
  return await submitTransaction(account, payload);
}

async function createHospital(account: AptosAccount) {
  const payload: Types.EntryFunctionPayload = {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::PatientHospitalVerification::create_hospital`,
    arguments: [],
    type_arguments: [],
  };
  return await submitTransaction(account, payload);
}

async function isPatientVerified(patientAddress: string): Promise<boolean> {
  try {
    const resourceType = `${MODULE_ADDRESS}::PatientHospitalVerification::PatientDetail`;
    const resource = await client.getAccountResource(patientAddress, resourceType);
    return resource.data.verified;
  } catch (error) {
    console.error('Error checking patient verification:', error);
    throw error;
  }
}

async function getVerifiedPatients(account: string): Promise<string[]> {
  try {
    const resourceType = `${MODULE_ADDRESS}::PatientHospitalVerification::Hospital`;
    const resource = await client.getAccountResource(account, resourceType);
    return resource.data.verified_patients;
  } catch (error) {
    console.error('Error getting verified patients:', error);
    throw error;
  }
}

const App: React.FC = () => {
  const { connect, disconnect, account } = useWallet();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(0);
  const [patientCondition, setPatientCondition] = useState('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verifiedPatients, setVerifiedPatients] = useState<string[]>([]);
  const handleRegisterPatient = async () => {
    if (account) { // Assuming `account` is already available from `useWallet`
      try {
        await registerPatient(account, patientName, patientAge, patientCondition);
        // Reset form fields or show a success message here
        setPatientName('');
        setPatientAge(0);
        setPatientCondition('');
        // Optionally, show a success message to the user
      } catch (error) {
        console.error("Error registering patient:", error);
        // Optionally, show an error message to the user
      }
    }
  };
  
  const handleVerifyPatient = async () => {
    if (account) {
      try {
        await verifyPatient(account, account.address.toString()); // Using toString() method for address
        const verified = await isPatientVerified(account.address.toString());
        setIsVerified(verified);
        // Optionally, show a success or status message to the user
      } catch (error) {
        console.error("Error verifying patient:", error);
        // Optionally, show an error message to the user
      }
    }
  };
  
  const handleCreateHospital = async () => {
    if (account) {
      try {
        await createHospital(account);
        // Optionally, show a success message to the user
      } catch (error) {
        console.error("Error creating hospital:", error);
        // Optionally, show an error message to the user
      }
    }
  };
  
  const handleGetVerifiedPatients = async () => {
    if (account) {
      try {
        const patients = await getVerifiedPatients(account.address.toString());
        setVerifiedPatients(patients);
        // Optionally, show a message or update UI based on the fetched data
      } catch (error) {
        console.error("Error getting verified patients:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <div className="App">
      <h1>Patient Hospital Verification System</h1>
      <WalletSelector />

        <>
     
            
          

          <section>
            <h2>Create Hospital</h2>
            <button onClick={handleCreateHospital}>Create Hospital</button>
          </section>

          <section>
            <h2>Register Patient</h2>
            <input
              type="text"
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Age"
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="Condition"
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
            />
            <button onClick={handleRegisterPatient}>Register</button>
          </section>

          <section>
            <h2>Verify Patient</h2>
            <button onClick={handleVerifyPatient}>Verify Your Account</button>
            {isVerified && <p>The account is verified as a patient.</p>}
          </section>

          <section>
            <h2>Verified Patients</h2>
            <button onClick={handleGetVerifiedPatients}>Show Verified Patients</button>
            <ul>
              {verifiedPatients.map((patient, index) => (
                <li key={index}>{patient}</li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </div>
  );
};

export default App;