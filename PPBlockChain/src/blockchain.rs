use std::collections::HashSet;
use crate::{block::Block, transaction::Transaction};

pub struct Blockchain {
    pub chain: Vec<Block>,
    pub difficulty: usize,
    pub pending_transactions: Vec<Transaction>,
    pub mining_reward: u64,
    pub nodes: HashSet<String>,
}

impl Blockchain {
    pub fn new() -> Self {
        let mut blockchain = Blockchain {
            chain: vec![],
            difficulty: 4,
            pending_transactions: vec![],
            mining_reward: 100,
            nodes: HashSet::new(),
        };

        blockchain.chain.push(blockchain.create_genesis_block());
        blockchain
    }

    fn create_genesis_block(&self) -> Block {
        Block::new(vec![], "0".to_string())
    }

    pub fn get_latest_block(&self) -> &Block {
        self.chain.last().unwrap()
    }

    pub fn create_transaction(&mut self, transaction: Transaction) {
        self.pending_transactions.push(transaction);
    }

    pub fn mine_pending_transactions(&mut self, mining_reward_address: String) {
        // 创建包含所有待处理交易的新区块
        let block = Block::new(
            self.pending_transactions.clone(),
            self.get_latest_block().hash.clone(),
        );

        // 挖矿以满足难度要求
        let mut block = block;
        block.mine_block(self.difficulty);

        println!("区块成功挖出!");
        self.chain.push(block);

        // 重置待处理交易列表并发送挖矿奖励
        self.pending_transactions = vec![Transaction::new(
            "null".to_string(),
            mining_reward_address,
            self.mining_reward,
        )];

        // 通知其他节点
        self.broadcast_new_block();
    }

    pub fn get_balance_of_address(&self, address: &str) -> i64 {
        let mut balance: i64 = 0;

        for block in &self.chain {
            for transaction in &block.transactions {
                if transaction.from_address == address {
                    balance -= transaction.amount as i64;
                }

                if transaction.to_address == address {
                    balance += transaction.amount as i64;
                }
            }
        }

        balance
    }

    pub fn is_chain_valid(&self) -> bool {
        for i in 1..self.chain.len() {
            let current_block = &self.chain[i];
            let previous_block = &self.chain[i - 1];

            // 验证当前区块的哈希值
            if current_block.hash != current_block.calculate_hash() {
                return false;
            }

            // 验证区块链接
            if current_block.previous_hash != previous_block.hash {
                return false;
            }
        }

        true
    }

    // 添加节点
    pub fn register_node(&mut self, node_url: String) {
        self.nodes.insert(node_url.clone());
        println!("节点 {} 已添加到网络", node_url);
    }

    // 广播新区块到所有节点
    fn broadcast_new_block(&self) {
        // 在实际应用中，这里应该使用HTTP请求或WebSocket向其他节点发送新区块
        println!("向所有节点广播新区块");
        for node in &self.nodes {
            println!("发送区块到节点: {}", node);
            // 这里应该有实际的网络通信代码
        }
    }

    // 接收新区块
    pub fn receive_new_block(&mut self, new_block: Block, sender_node_url: String) -> bool {
        let latest_block = self.get_latest_block();

        // 验证新区块的previous_hash是否指向我们的最新区块
        if new_block.previous_hash != latest_block.hash {
            println!("拒绝区块: previous_hash不匹配");
            return false;
        }

        // 验证新区块的哈希值是否满足难度要求
        let target = "0".repeat(self.difficulty);
        if !new_block.hash.starts_with(&target) {
            println!("拒绝区块: 工作量证明无效");
            return false;
        }

        // 添加新区块到链中
        self.chain.push(new_block);
        println!("接受来自节点 {} 的新区块", sender_node_url);

        // 更新待处理交易
        // 注意：在实际实现中，我们需要更复杂的逻辑来匹配交易
        self.pending_transactions.clear();

        true
    }

    // 解决链冲突 - 共识算法
    pub fn resolve_conflicts(&mut self, chains: Vec<Vec<Block>>) -> bool {
        let mut max_length = self.chain.len();
        let mut new_chain: Option<Vec<Block>> = None;

        // 寻找最长的有效链
        for chain in chains {
            if chain.len() > max_length && self.is_valid_chain(&chain) {
                max_length = chain.len();
                new_chain = Some(chain);
            }
        }

        // 如果找到了更长的有效链，替换当前链
        if let Some(chain) = new_chain {
            self.chain = chain;
            println!("链已替换为更长的链");
            return true;
        }

        println!("当前链已是最长链");
        false
    }

    // 验证提供的链是否有效
    fn is_valid_chain(&self, chain: &Vec<Block>) -> bool {
        // 检查创世区块
        if chain[0].previous_hash != "0" {
            return false;
        }

        // 验证链中的每个区块
        for i in 1..chain.len() {
            let block = &chain[i];
            let previous_block = &chain[i - 1];

            if block.previous_hash != previous_block.hash {
                return false;
            }

            if block.hash != block.calculate_hash() {
                return false;
            }
        }

        true
    }
}