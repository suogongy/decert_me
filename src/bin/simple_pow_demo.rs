use sha2::{Sha256, Digest};
use std::time::Instant;

fn main() {
    let nickname = "decertme001-rudy"; 
    
    // 查找4个0开头的哈希值
    println!("开始寻找4个0开头的哈希值...");
    let start_time: Instant = Instant::now();
    let (nonce_4, hash_4) = find_hash_with_leading_zeros(nickname, 4);
    let elapsed_4 = start_time.elapsed();
    
    println!("找到4个0开头的哈希值:");
    println!("  花费时间: {:?}", elapsed_4);
    println!("  nickname: {}, nonce: {}", nickname, nonce_4);
    println!("  哈希值: {}", hash_4);
    println!();
    
    // 查找5个0开头的哈希值
    println!("开始寻找5个0开头的哈希值...");
    let start_time = Instant::now();
    let (nonce_5, hash_5) = find_hash_with_leading_zeros(nickname, 5);
    let elapsed_5 = start_time.elapsed();
    
    println!("找到5个0开头的哈希值:");
    println!("  花费时间: {:?}", elapsed_5);
    println!("  nickname: {}, nonce: {}", nickname, nonce_5);
    println!("  哈希值: {}", hash_5);
}

fn find_hash_with_leading_zeros(prefix: &str, zeros: usize) -> (u64, String) {
    let mut nonce = 0;
    let leading_zeros: String = std::iter::repeat('0').take(zeros).collect();
    
    loop {
        let input = format!("{}{}", prefix, nonce);
        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        let result = hasher.finalize();
        let hash = format!("{:x}", result);
        
        if hash.starts_with(&leading_zeros) {
            return (nonce, hash);
        }
        
        nonce += 1;
    }
}