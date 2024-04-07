
address address {

module PatientHospitalVerification {
use 0x1::vector;
    use 0x1::signer;
    use 0x1::string;

    // Errors
    const EALREADY_VERIFIED: u64 = 1;
    const ENOT_FOUND: u64 = 2;
    const ENOT_AUTHORIZED: u64 = 3;

    struct PatientDetail has key, store, drop {
        name: string::String,
        age: u64,
        condition: string::String,
        verified: bool,
    }

    struct Hospital has key, store {
        verified_patients: vector<address>,
    }

    public fun register_patient(account: &signer, name: string::String, age: u64, condition: string::String) {
        let patient_detail = PatientDetail {
            name: name,
            age: age,
            condition: condition,
            verified: false,
        };
        move_to(account, patient_detail);
    }

    public fun verify_patient(hospital_account: &signer, patient_addr: address) acquires PatientDetail, Hospital {
        let hospital = borrow_global_mut<Hospital>(signer::address_of(hospital_account));
        let patient_detail = borrow_global_mut<PatientDetail>(patient_addr);
        assert!(!patient_detail.verified, EALREADY_VERIFIED);
        patient_detail.verified = true;
        vector::push_back(&mut hospital.verified_patients, patient_addr);
    }

    public fun create_hospital(account: &signer) {
        let hospital = Hospital {
            verified_patients: vector::empty<address>(),
        };
        move_to(account, hospital);
    }

    public fun is_patient_verified(patient_addr: address): bool acquires PatientDetail {
        let patient_detail = borrow_global<PatientDetail>(patient_addr);
        patient_detail.verified
    }

    public fun get_verified_patients(hospital_account: &signer): vector<address> acquires Hospital {
        let hospital = borrow_global<Hospital>(signer::address_of(hospital_account));
        hospital.verified_patients
    }
}
}