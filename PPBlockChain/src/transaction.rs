use sha2::{Sha256, Digest};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub from_address: String,
    pub to_address: String,
    pub amount: u64,
    pub timestamp: u64,
}

impl Transaction {
    pub fn new(from_address: String, to_address: String, amount: u64) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis() as u64;

        Transaction {
            from_address,
            to_address,
            amount,
            timestamp,
        }
    }

    pub fn calculate_hash(&self) -> String {
        let mut hasher = Sha256::new();
        hasher.update(&self.from_address);
        hasher.update(&self.to_address);
        hasher.update(&self.amount.to_string());
        hasher.update(&self.timestamp.to_string());
        format!("{:x}", hasher.finalize())
    }
}