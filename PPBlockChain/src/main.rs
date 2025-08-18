mod transaction;
mod block;
mod blockchain;

use transaction::Transaction;
use blockchain::Blockchain;

fn main() {
    // 创建区块链实例
    let mut pp_blockchain = Blockchain::new();
    println!("创建区块链...");

    // 创建一些交易
    println!("创建交易...");
    pp_blockchain.create_transaction(Transaction::new("address1".to_string(), "address2".to_string(), 100));
    pp_blockchain.create_transaction(Transaction::new("address2".to_string(), "address1".to_string(), 50));

    // 挖矿
    println!("开始挖矿...");
    pp_blockchain.mine_pending_transactions("miner-address".to_string());

    // 查看矿工余额
    println!("矿工余额: {}", pp_blockchain.get_balance_of_address("miner-address"));

    // 再创建一些交易
    pp_blockchain.create_transaction(Transaction::new("address1".to_string(), "address2".to_string(), 200));
    pp_blockchain.create_transaction(Transaction::new("address2".to_string(), "address1".to_string(), 100));

    // 再次挖矿
    println!("再次挖矿...");
    pp_blockchain.mine_pending_transactions("miner-address".to_string());

    // 再次查看矿工余额
    println!("矿工余额: {}", pp_blockchain.get_balance_of_address("miner-address"));

    // 验证区块链
    println!("区块链是否有效: {}", pp_blockchain.is_chain_valid());
}