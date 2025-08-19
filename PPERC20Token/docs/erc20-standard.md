# ERC-20 Token Standard Detailed Introduction (ERC-20 代币标准详细介绍)

## What is ERC-20? (什么是 ERC-20?)

ERC-20 stands for Ethereum Request for Comment 20, and it defines a standard interface for tokens on the Ethereum blockchain. This standard allows developers to create tokens that are interoperable with other smart contracts and applications in the Ethereum ecosystem.

ERC-20 代表以太坊征求意见 20，它定义了以太坊区块链上代币的标准接口。这个标准允许开发者创建能够与以太坊生态系统中的其他智能合约和应用程序互操作的代币。

The ERC-20 standard was proposed by Fabian Vogelsteller in November 2015 and officially became a standard in September 2017. Since then, it has become the most widely adopted token standard on Ethereum, with thousands of tokens built using this standard.

ERC-20 标准由 Fabian Vogelsteller 于 2015 年 11 月提出，并于 2017 年 9 月正式成为标准。从那时起，它已成为以太坊上最广泛采用的代币标准，有数千种代币使用此标准构建。

## Why ERC-20 Matters (为什么 ERC-20 很重要)

Before ERC-20, each token project had its own implementation, which made it difficult for wallets, exchanges, and other smart contracts to interact with different tokens. ERC-20 solved this problem by providing a common set of rules that all tokens must follow, enabling:

在 ERC-20 之前，每个代币项目都有自己的实现，这使得钱包、交易所和其他智能合约难以与不同的代币交互。ERC-20 通过提供一套所有代币都必须遵循的通用规则解决了这个问题，实现了：

1. Seamless integration with wallets (与钱包的无缝集成)
2. Easy listing on exchanges (在交易所轻松上市)
3. Compatibility with decentralized applications (dApps) (与去中心化应用程序 (dApps) 的兼容性)
4. Simplified token development process (简化的代币开发流程)

## ERC-20 Interface Specification (ERC-20 接口规范)

The ERC-20 standard defines a set of mandatory and optional functions and events that every compliant token contract must implement.

ERC-220 标准定义了一套每个合规代币合约都必须实现的强制性和可选函数及事件。

### Mandatory Functions (必需函数)

#### 1. totalSupply()
```solidity
function totalSupply() external view returns (uint256)
```
Returns the total token supply. (返回代币总供应量。)

#### 2. balanceOf()
```solidity
function balanceOf(address _owner) external view returns (uint256 balance)
```
Returns the account balance of another account with address `_owner`. (返回地址为 `_owner` 的账户余额。)

#### 3. transfer()
```solidity
function transfer(address _to, uint256 _value) external returns (bool success)
```
Transfers `_value` amount of tokens to address `_to`, and MUST fire the `Transfer` event. The function SHOULD throw if the message caller's account balance does not have enough tokens to spend.

将 `_value` 数量的代币转移到地址 `_to`，并且必须触发 `Transfer` 事件。如果消息调用者的账户余额没有足够的代币可花费，该函数应该抛出异常。

#### 4. transferFrom()
```solidity
function transferFrom(address _from, address _to, uint256 _value) external returns (bool success)
```
Transfers `_value` amount of tokens from address `_from` to address `_to`, and MUST fire the `Transfer` event.

将 `_value` 数量的代币从地址 `_from` 转移到地址 `_to`，并且必须触发 `Transfer` 事件。

#### 5. approve()
```solidity
function approve(address _spender, uint256 _value) external returns (bool success)
```
Allows `_spender` to withdraw from your account multiple times, up to the `_value` amount. If this function is called again it overwrites the current allowance with `_value`.

允许 `_spender` 多次从您的账户中提取，最多提取 `_value` 数量。如果再次调用此函数，它将用 `_value` 覆盖当前的授权额度。

#### 6. allowance()
```solidity
function allowance(address _owner, address _spender) external view returns (uint256 remaining)
```
Returns the amount which `_spender` is still allowed to withdraw from `_owner`.

返回 `_spender` 仍被允许从 `_owner` 提取的数量。

### Mandatory Events (必需事件)

#### 1. Transfer
```solidity
event Transfer(address indexed _from, address indexed _to, uint256 _value)
```
MUST trigger when tokens are transferred, including zero value transfers.

当代币被转移时必须触发，包括零值转移。

#### 2. Approval
```solidity
event Approval(address indexed _owner, address indexed _spender, uint256 _value)
```
MUST trigger on any successful call to `approve(address _spender, uint256 _value)`.

在成功调用 `approve(address _spender, uint256 _value)` 时必须触发。

### Optional Functions (可选函数)

#### 1. name()
```solidity
function name() external view returns (string)
```
Returns the name of the token - e.g. "MyToken". (返回代币的名称，例如"MyToken"。)

#### 2. symbol()
```solidity
function symbol() external view returns (string)
```
Returns the symbol of the token - e.g. "MT". (返回代币的符号，例如"MT"。)

#### 3. decimals()
```solidity
function decimals() external view returns (uint8)
```
Returns the number of decimals the token uses - e.g. 8 means to divide the token amount by 100000000 to get its user representation.

返回代币使用的小数位数，例如 8 表示将代币数量除以 100000000 得到其用户表示。

## Implementation Rules (实现规则)

### Transfer Rules (转账规则)

1. A token contract which creates new tokens SHOULD trigger a Transfer event with the `_from` address set to `0x0` when tokens are created.

创建新代币的代币合约在创建代币时应该触发一个 `_from` 地址设置为 `0x0` 的 Transfer 事件。

2. A token contract which burns tokens SHOULD trigger a Transfer event with the `_to` address set to `0x0` when tokens are burned.

销毁代币的代币合约在销毁代币时应该触发一个 `_to` 地址设置为 `0x0` 的 Transfer 事件。

### Transfer Mechanism (转账机制)

The transfer mechanism in ERC-20 works in two ways:

ERC-20 中的转账机制有两种工作方式：

1. **Direct Transfer**: Using the `transfer()` function to send tokens directly to another address.

**直接转账**：使用 `transfer()` 函数将代币直接发送到另一个地址。

2. **Approved Transfer**: Using the `approve()` and `transferFrom()` functions to allow a third party to transfer tokens on your behalf.

**授权转账**：使用 `approve()` 和 `transferFrom()` 函数允许第三方代表您转移代币。

## ERC-20 Workflow Examples (ERC-20 工作流程示例)

### Simple Transfer (简单转账)

1. Alice wants to send 100 tokens to Bob (Alice 想要发送 100 个代币给 Bob)
2. Alice calls `transfer(Bob's address, 100)` (Alice 调用 `transfer(Bob 的地址, 100)`)
3. The contract checks if Alice has sufficient balance (合约检查 Alice 是否有足够的余额)
4. If yes, 100 tokens are deducted from Alice's balance and added to Bob's balance (如果是，从 Alice 的余额中扣除 100 个代币，并添加到 Bob 的余额中)
5. A `Transfer` event is emitted (发出 `Transfer` 事件)

### Approved Transfer (授权转账)

1. Alice wants to allow a contract to spend 100 of her tokens (Alice 想要允许一个合约花费她的 100 个代币)
2. Alice calls `approve(contract address, 100)` (Alice 调用 `approve(合约地址, 100)`)
3. The contract now has permission to spend up to 100 of Alice's tokens (合约现在有权花费最多 100 个 Alice 的代币)
4. An `Approval` event is emitted (发出 `Approval` 事件)
5. When the contract needs to spend tokens, it calls `transferFrom(Alice's address, recipient, amount)` (当合约需要花费代币时，它调用 `transferFrom(Alice 的地址, 接收者, 数量)`)
6. The contract checks if it has sufficient allowance (合约检查是否有足够的授权额度)
7. If yes, tokens are transferred and allowance is reduced (如果是，代币被转移且授权额度减少)
8. A `Transfer` event is emitted (发出 `Transfer` 事件)

## Common Use Cases (常见使用场景)

ERC-20 tokens are used for a wide variety of applications:

ERC-20 代币用于各种各样的应用：

1. **Utility Tokens**: Tokens that provide access to a product or service (实用代币：提供产品或服务访问权限的代币)
2. **Security Tokens**: Tokens that represent ownership in an asset or company (证券型代币：代表资产或公司所有权的代币)
3. **Governance Tokens**: Tokens that allow holders to vote on protocol decisions (治理代币：允许持有者对协议决策进行投票的代币)
4. **Stablecoins**: Tokens pegged to the value of another asset like USD (稳定币：与美元等其他资产价值挂钩的代币)
5. **Reward Tokens**: Tokens given as rewards for specific actions or behaviors (奖励代币：作为特定行为或活动奖励的代币)

## Advantages of ERC-20 (ERC-20 的优势)

1. **Standardization**: All ERC-20 tokens follow the same rules, making them predictable and easy to integrate (标准化：所有 ERC-20 代币遵循相同规则，使其可预测且易于集成)
2. **Interoperability**: Works seamlessly with wallets, exchanges, and other smart contracts (互操作性：与钱包、交易所和其他智能合约无缝协作)
3. **Liquidity**: Easy to trade on decentralized and centralized exchanges (流动性：在去中心化和中心化交易所易于交易)
4. **Developer Friendly**: Well-documented standard with plenty of examples and tools (对开发者友好：文档齐全的标准，有大量示例和工具)
5. **Ecosystem Support**: Supported by all major Ethereum wallets and infrastructure (生态系统支持：得到所有主要以太坊钱包和基础设施的支持)

## Limitations of ERC-20 (ERC-20 的局限性)

1. **Gas Costs**: Each transfer requires gas fees (Gas 成本：每次转账都需要 Gas 费用)
2. **No Native Support for Complex Logic**: Basic standard doesn't support more complex token behaviors (不支持复杂逻辑：基本标准不支持更复杂的代币行为)
3. **Approval Race Condition**: The approve function has a known race condition (授权竞争条件：approve 函数存在已知的竞争条件)
4. **No Metadata Standard**: No standard way to attach metadata to tokens (无元数据标准：没有标准方法将元数据附加到代币)
5. **Incompatibility with Some DeFi Protocols**: Some newer protocols require more advanced token standards (与某些 DeFi 协议不兼容：一些新协议需要更高级的代币标准)

## ERC-20 vs Other Token Standards (ERC-20 与其他代币标准的比较)

### ERC-20 vs ERC-721

- **ERC-20**: Fungible tokens (each token is identical and interchangeable) (同质化代币：每个代币都是相同的且可互换的)
- **ERC-721**: Non-fungible tokens (each token is unique) (非同质化代币：每个代币都是唯一的)

### ERC-20 vs ERC-777

- **ERC-20**: Simpler standard with basic functionality (更简单的标准，具有基本功能)
- **ERC-777**: More advanced with features like operators, send hooks, and improved user experience (更高级，具有操作员、发送钩子和改进的用户体验等功能)

### ERC-20 vs ERC-1155

- **ERC-20**: Single token contract per token type (每种代币类型一个代币合约)
- **ERC-1155**: Multi-token standard supporting both fungible and non-fungible tokens in one contract (多代币标准，在一个合约中支持同质化和非同质化代币)

## Conclusion (结论)

ERC-20 has been fundamental to the growth of the Ethereum ecosystem and the broader blockchain industry. It provides a simple, standardized way to create tokens that can be easily integrated into wallets, exchanges, and other applications. While newer standards have emerged with additional features, ERC-20 remains the most widely used token standard due to its simplicity and broad compatibility.

ERC-20 对以太坊生态系统和更广泛的区块链行业的发展至关重要。它提供了一种简单、标准化的方法来创建代币，这些代币可以轻松集成到钱包、交易所和其他应用程序中。尽管出现了具有附加功能的新标准，但由于其简单性和广泛的兼容性，ERC-20 仍然是使用最广泛的代币标准。

Understanding ERC-20 is essential for anyone working with Ethereum-based tokens, whether as a developer, investor, or user. Its standardized interface has enabled the rapid growth of decentralized finance (DeFi), tokenized assets, and countless other blockchain applications.

对于任何使用基于以太坊代币的人来说，理解 ERC-20 都是至关重要的，无论是作为开发者、投资者还是用户。其标准化接口推动了去中心化金融 (DeFi)、代币化资产和无数其他区块链应用的快速增长。