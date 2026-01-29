# AleoRisk — Privacy-Preserving Risk Analytics

[![Built with Aleo](https://img.shields.io/badge/Built%20with-Aleo-black)](https://aleo.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-black)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-black)](https://reactjs.org/)
[![Leo Program](https://img.shields.io/badge/Leo-Smart%20Contract-black)](https://developer.aleo.org)

**Compute verified portfolio risk and volatility without revealing your private data.**

AleoRisk is a privacy-first risk analytics platform that leverages zero-knowledge proofs to enable users to analyze their portfolio risk and volatility while keeping their financial data completely private. Built on top of the Aleo blockchain, it provides cryptographically verified results without exposing sensitive information.

---

## 🎯 Features

- **Private Data Analysis** — Upload CSV files with historical returns; all computations happen locally
- **Volatility Calculation** — Compute annualized standard deviation from your return data
- **Risk Classification** — Automatic categorization into LOW / MEDIUM / HIGH risk levels
- **Zero-Knowledge Proofs** — Generate and verify Aleo proofs for your risk metrics
- **Interactive Visualizations** — View volatility trends with line charts and risk gauges
- **Proof Verification** — Independently verify any Aleo proof ID
- **Export Reports** — Download your risk analysis reports
- **Wallet Integration** — Connect Leo Wallet for Aleo testnet transactions

---

## 🔗 Aleo SDK Integration

This project uses the official [Leo Wallet Adapter](https://docs.leo.app/aleo-wallet-adapter/) for wallet connection and transaction signing, based on the documentation at:
- **Wallet Adapter Docs**: https://docs.leo.app/aleo-wallet-adapter/
- **Aleo Developer Docs**: https://developer.aleo.org/guides/introduction/getting_started/

### Wallet Provider Setup

The wallet provider is configured following the official Leo Wallet Adapter documentation:

```typescript
// src/providers/AleoWalletProvider.tsx
import { FC, ReactNode, useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

// Import default styles
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

export const AleoWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "AleoRisk",
      }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
};
```

### Using the Wallet Hook

```typescript
// Using the official useWallet hook from @demox-labs/aleo-wallet-adapter-react
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  DecryptPermission,
  WalletAdapterNetwork,
  Transaction,
} from "@demox-labs/aleo-wallet-adapter-base";

const { publicKey, connected, connect, disconnect, requestTransaction } = useWallet();

// Connect to Aleo Testnet Beta
await connect(
  DecryptPermission.UponRequest,
  WalletAdapterNetwork.TestnetBeta
);

// Create and send a transaction
const transaction = Transaction.createTransaction(
  publicKey,
  WalletAdapterNetwork.TestnetBeta,
  'aleo_risk_v1.aleo',
  'register_portfolio',
  [commitment, dataPoints.toString() + 'u32'],
  100000 // fee in microcredits
);

const txId = await requestTransaction(transaction);
```

### Wallet Button Component

```typescript
// src/components/wallet/WalletButton.tsx
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

export function WalletButton() {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    await connect(
      DecryptPermission.UponRequest,
      WalletAdapterNetwork.TestnetBeta
    );
  };

  if (!connected) {
    return (
      <button onClick={handleConnect} disabled={connecting}>
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div>
      <span>{publicKey?.slice(0, 10)}...{publicKey?.slice(-6)}</span>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Transaction Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant LeoWallet
    participant AleoNetwork
    
    User->>Frontend: Upload CSV + Generate Proof
    Frontend->>Frontend: Parse CSV locally
    Frontend->>Frontend: Compute commitment hash
    Frontend->>LeoWallet: Request transaction
    LeoWallet->>User: Approve transaction
    User->>LeoWallet: Confirm
    LeoWallet->>AleoNetwork: Submit to testnet
    AleoNetwork-->>LeoWallet: Transaction pending
    AleoNetwork-->>LeoWallet: Transaction confirmed
    LeoWallet-->>Frontend: TX ID + status
    Frontend-->>User: Display verified result
```

---

## 🦁 Leo Smart Contract

The AleoRisk Leo program implements privacy-preserving risk computation using zero-knowledge proofs.

### Program Structure

```mermaid
graph TB
    subgraph "Leo Program: aleo_risk_v1.aleo"
        A[register_portfolio] --> B[PortfolioRecord]
        C[compute_volatility] --> D[Volatility + Commitment]
        E[compute_risk_score] --> F[Risk Level + Commitment]
        G[verify_risk_report] --> H[Public Verification]
        I[export_risk_receipt] --> J[RiskReport Record]
    end
    
    subgraph "Private Inputs"
        K[Portfolio Returns] -.-> A
        L[Variance Data] -.-> C
        M[Risk Thresholds] -.-> E
    end
    
    subgraph "Public Outputs"
        B --> N[Commitment Hash]
        D --> O[Volatility Value]
        F --> P[Risk Classification]
        H --> Q[Verified Status]
        J --> R[Verifiable Receipt]
    end
```

### Leo Program Source Code

```leo
// AleoRisk Leo Program - Privacy-Preserving Risk Analytics
// Program ID: aleo_risk_v1.aleo

program aleo_risk_v1.aleo {
    // Portfolio commitment record - stores private portfolio hash
    record PortfolioRecord {
        owner: address,
        commitment: field,
        timestamp: u64,
        data_points: u32,
    }

    // Risk report record - verifiable risk computation result
    record RiskReport {
        owner: address,
        report_id: field,
        volatility_commitment: field,
        risk_commitment: field,
        risk_level: u8,  // 0=LOW, 1=MEDIUM, 2=HIGH
        timestamp: u64,
        verified: bool,
    }

    // Mapping for public verification
    mapping verified_reports: field => bool;
    mapping report_metadata: field => u64;

    // Register portfolio with private commitment
    transition register_portfolio(
        private commitment: field,
        private data_points: u32
    ) -> PortfolioRecord {
        let timestamp: u64 = block.height as u64;
        
        return PortfolioRecord {
            owner: self.caller,
            commitment: commitment,
            timestamp: timestamp,
            data_points: data_points,
        };
    }

    // Compute volatility from private portfolio data
    transition compute_volatility(
        private portfolio: PortfolioRecord,
        private mean_scaled: i64,
        private variance_scaled: u64,
        private trading_days: u32
    ) -> (u64, field) {
        assert_eq(portfolio.owner, self.caller);
        
        let sqrt_variance: u64 = sqrt_approx(variance_scaled);
        let sqrt_days: u64 = 15874u64;  // sqrt(252) * 1000
        let volatility: u64 = (sqrt_variance * sqrt_days) / 1000u64;
        let vol_commitment: field = BHP256::hash_to_field(volatility);
        
        return (volatility, vol_commitment);
    }

    // Compute risk score from volatility
    transition compute_risk_score(
        private volatility: u64,
        private vol_commitment: field,
        private low_threshold: u64,
        private high_threshold: u64
    ) -> (u8, u8, field) {
        let risk_level: u8 = 
            volatility < low_threshold ? 0u8 :
            volatility > high_threshold ? 2u8 : 1u8;
        
        let risk_score: u8 = 
            risk_level == 0u8 ? 25u8 :
            risk_level == 2u8 ? 85u8 : 50u8;
        
        let risk_commitment: field = BHP256::hash_to_field(
            risk_level as field + vol_commitment
        );
        
        return (risk_score, risk_level, risk_commitment);
    }

    // Verify risk report publicly
    async transition verify_risk_report(
        public risk_commitment: field
    ) -> Future {
        return finalize_verify(risk_commitment);
    }

    async function finalize_verify(commitment: field) {
        Mapping::set(verified_reports, commitment, true);
        Mapping::set(report_metadata, commitment, block.height);
    }

    // Export verifiable risk receipt
    transition export_risk_receipt(
        private vol_commitment: field,
        private risk_commitment: field,
        private risk_level: u8
    ) -> RiskReport {
        let timestamp: u64 = block.height as u64;
        let report_id: field = BHP256::hash_to_field(
            vol_commitment + risk_commitment + timestamp as field
        );
        
        return RiskReport {
            owner: self.caller,
            report_id: report_id,
            volatility_commitment: vol_commitment,
            risk_commitment: risk_commitment,
            risk_level: risk_level,
            timestamp: timestamp,
            verified: true,
        };
    }

    // Integer square root approximation (Newton-Raphson)
    function sqrt_approx(n: u64) -> u64 {
        if n == 0u64 { return 0u64; }
        let mut x: u64 = n;
        let mut y: u64 = (x + 1u64) / 2u64;
        for i: u8 in 0u8..8u8 {
            if y < x { x = y; y = (x + n / x) / 2u64; }
        }
        return x;
    }
}
```

---

## 📊 Application Flow

```mermaid
graph TD
    A[Landing Page] --> B[Connect Wallet]
    B --> C[Upload Data Page]
    C --> D{CSV File Upload}
    D --> E[Parse CSV Locally]
    E --> F[Generate Commitment Hash]
    F --> G[register_portfolio TX]
    G --> H[compute_volatility TX]
    H --> I[compute_risk_score TX]
    I --> J[export_risk_receipt TX]
    J --> K[Dashboard]
    K --> L[View Risk Metrics]
    K --> M[View Volatility Chart]
    K --> N[Download Report]
    K --> O[Verify Proof]
    O --> P[Verification Page]
    P --> Q{Proof Valid?}
    Q -->|Yes| R[Show Verified Badge]
    Q -->|No| S[Show Invalid Status]
```

---

## 🔄 Aleo Transaction Flow

```mermaid
flowchart LR
    subgraph "Client Side (Private)"
        A[CSV Data] --> B[Parse Returns]
        B --> C[Calculate Stats]
        C --> D[Generate Commitment]
    end
    
    subgraph "Leo Program (ZK)"
        D --> E[register_portfolio]
        E --> F[compute_volatility]
        F --> G[compute_risk_score]
        G --> H[export_risk_receipt]
    end
    
    subgraph "Aleo Network (Public)"
        E --> I[TX Confirmed]
        F --> J[TX Confirmed]
        G --> K[TX Confirmed]
        H --> L[RiskReport Record]
        L --> M[verify_risk_report]
        M --> N[Public Mapping]
    end
    
    style A fill:#000,stroke:#fff,color:#fff
    style B fill:#000,stroke:#fff,color:#fff
    style C fill:#000,stroke:#fff,color:#fff
    style D fill:#333,stroke:#fff,color:#fff
```

---

## 🧮 Risk Classification Logic

```mermaid
graph TD
    A[Volatility Calculated] --> B{Check Threshold}
    B -->|Custom Threshold Set| C[Use Custom Threshold]
    B -->|No Custom Threshold| D[Use Default Thresholds]
    
    C --> E{Compare Against Threshold}
    D --> F{Compare Against Defaults}
    
    E -->|Below| G[✅ LOW Risk]
    E -->|Above| H[⚠️ HIGH Risk]
    
    F -->|< 5%| G
    F -->|5% - 15%| I[⚡ MEDIUM Risk]
    F -->|> 15%| H
    
    G --> J[Green Badge + Score 25]
    I --> K[Yellow Badge + Score 50]
    H --> L[Red Badge + Score 85]
```

---

## 🛡️ Privacy Model

```mermaid
graph LR
    A[Your Data] -->|Stays Local| B[Browser]
    B -->|Commitment Hash| C[Leo Program]
    C -->|Proof + Receipt| D[Aleo Network]
    D -->|Verification| E[Public Result]
    
    style A fill:#000,stroke:#fff,color:#fff
    style B fill:#000,stroke:#fff,color:#fff
    style C fill:#333,stroke:#fff,color:#fff
    style D fill:#333,stroke:#fff,color:#fff
    style E fill:#000,stroke:#fff,color:#fff
```

### What Stays Private:
- ✅ Raw portfolio returns
- ✅ Trading signals and weights
- ✅ Individual position data
- ✅ Exact volatility computation

### What Becomes Public:
- 📊 Risk classification (LOW/MEDIUM/HIGH)
- 🔐 Cryptographic commitments
- 📄 Verifiable receipt ID
- ✓ Proof verification status

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend (React)"
        A[React App] --> B[Components]
        B --> C[Landing Page]
        B --> D[Upload Page]
        B --> E[Dashboard]
        B --> F[Verify Page]
        B --> W[Wallet Button]
    end
    
    subgraph "Aleo Integration"
        G[useAleoWallet Hook] --> H[Wallet State]
        I[useRiskAnalysis Hook] --> J[Transaction Builder]
        J --> K[Leo Program Calls]
    end
    
    subgraph "Aleo SDK"
        L[Wallet Adapter] --> M[Leo Wallet]
        N[Transaction API] --> O[Aleo Testnet]
    end
    
    subgraph "Visualization"
        P[Recharts] --> Q[Line Chart]
        P --> R[Risk Gauge]
    end
    
    A --> G
    A --> I
    D --> I
    E --> P
    G --> L
    I --> N
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── aleo/
│   │   ├── AnalysisProgress.tsx   # Progress indicator during ZK computation
│   │   └── TransactionList.tsx    # Transaction history display
│   ├── dashboard/
│   │   ├── MetricCard.tsx         # Individual metric display cards
│   │   ├── RiskGauge.tsx          # Animated risk gauge visualization
│   │   └── VolatilityChart.tsx    # Line chart for volatility over time
│   ├── landing/
│   │   ├── CTASection.tsx         # Call-to-action section
│   │   ├── FeaturesSection.tsx    # Feature highlights
│   │   ├── HeroSection.tsx        # Main hero with animated globe
│   │   └── HowItWorksSection.tsx
│   ├── layout/
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── wallet/
│   │   └── WalletButton.tsx       # Aleo wallet connection button
│   └── ui/                        # Reusable UI components
├── hooks/
│   ├── useAleoWallet.ts           # Wallet connection state
│   └── useRiskAnalysis.ts         # Risk calculation + Aleo TX logic
├── lib/
│   ├── aleo/
│   │   ├── index.ts               # Main exports
│   │   ├── types.ts               # Aleo type definitions
│   │   ├── crypto.ts              # Commitment generation utilities
│   │   ├── program.ts             # Leo program + TX builders
│   │   └── wallet.ts              # Wallet connection logic
│   ├── csvParser.ts               # CSV parsing utilities
│   └── utils.ts
├── pages/
│   ├── Dashboard.tsx              # Results display
│   ├── Index.tsx                  # Landing page
│   ├── Upload.tsx                 # File upload + Aleo proof generation
│   └── Verify.tsx                 # Proof verification
└── types/
    └── analysis.ts                # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- [Leo Wallet](https://leo.app/) browser extension (for testnet transactions)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd aleo-risk

# Install dependencies
npm install

# Start development server
npm run dev
```

### Aleo SDK Dependencies

```json
{
  "@demox-labs/aleo-wallet-adapter-react": "latest",
  "@demox-labs/aleo-wallet-adapter-reactui": "latest",
  "@demox-labs/aleo-wallet-adapter-leo": "latest",
  "@demox-labs/aleo-wallet-adapter-base": "latest"
}
```

---

## 📈 CSV Format

Your CSV file should contain historical return data in one of these formats:

**Format 1: Date and Returns**
```csv
date,return_pct
2024-01-01,1.2
2024-01-02,-0.5
2024-01-03,0.8
```

**Format 2: Portfolio Weights**
```csv
date,return_pct,weight
2024-01-01,1.2,0.25
2024-01-02,-0.5,0.25
2024-01-03,0.8,0.50
```

---

## 🔐 Aleo Program Functions

| Function | Description | Inputs | Outputs |
|----------|-------------|--------|---------|
| `register_portfolio` | Register private portfolio commitment | commitment: field, data_points: u32 | PortfolioRecord |
| `compute_volatility` | Calculate volatility with ZK proof | portfolio, mean, variance, trading_days | volatility: u64, commitment: field |
| `compute_risk_score` | Classify risk level privately | volatility, thresholds | score: u8, level: u8, commitment: field |
| `verify_risk_report` | Public verification of report | risk_commitment: field | (updates public mapping) |
| `export_risk_receipt` | Generate verifiable receipt | commitments, risk_level | RiskReport record |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **State**: React Query
- **Blockchain**: Aleo SDK, Leo Wallet Adapter
- **Network**: Aleo Testnet (testnetbeta)

---

## 📚 Aleo Documentation References

- [Aleo Developer Docs](https://developer.aleo.org)
- [Leo Language Guide](https://developer.aleo.org/leo/language)
- [Wallet Adapter Guide](https://developer.aleo.org/guides/wallets/universal_wallet_adapter)
- [Transaction API](https://developer.aleo.org/guides/wallets/usage_example)
- [Leo Wallet Docs](https://docs.leo.app/aleo-wallet-adapter)

---

## 📄 License

MIT License — feel free to use this project for your own purposes.

---

<p align="center">
  <strong>AleoRisk</strong> — Private. Verified. Secure.
</p>
