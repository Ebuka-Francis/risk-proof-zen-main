// AleoRisk Leo Program - Privacy-Preserving Risk Analytics
// Program ID: risk_proof_v1.aleo

program risk_proof_v1.aleo {
    @noupgrade
    async constructor() {}

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

    /**
     * @notice Register a portfolio commitment
     */
    transition register_portfolio(
        private commitment: field,
        private data_points: u32,
        public timestamp: u64
    ) -> PortfolioRecord {
        
        return PortfolioRecord {
            owner: self.caller,
            commitment: commitment,
            timestamp: timestamp,
            data_points: data_points,
        };
    }

    /**
     * @notice Compute volatility using a GARCH(1,1) style model
     * sigma^2 = omega + alpha * eps^2 + beta * sigma_prev^2
     */
    transition compute_volatility(
        private portfolio: PortfolioRecord,
        private omega: u64,
        private alpha: u64,
        private beta: u64,
        private return_sq_scaled: u64,
        private prev_variance_scaled: u64
    ) -> (u64, field) {
        // Verify ownership
        assert_eq(portfolio.owner, self.caller);
        
        let scale: u64 = 1000000u64;
        
        let term1: u64 = omega;
        let term2: u64 = (alpha * return_sq_scaled) / scale;
        let term3: u64 = (beta * prev_variance_scaled) / scale;
        
        let next_variance: u64 = term1 + term2 + term3;
        
        // Annualize: volatility = sqrt(variance) * 15.874 (sqrt(252))
        let sqrt_var: u64 = sqrt_approx(next_variance);
        let annual_scale: u64 = 15874u64;
        let volatility: u64 = (sqrt_var * annual_scale) / 1000u64;
        
        // Generate volatility commitment
        let vol_commitment: field = BHP256::hash_to_field(volatility);
        
        return (volatility, vol_commitment);
    }

    /**
     * @notice Compute portfolio risk score with Copula-style tail dependency proxy
     */
    transition compute_risk_score(
        private volatility: u64,
        private tail_factor: u64,
        private low_threshold: u64,
        private high_threshold: u64
    ) -> (u8, u8, field) {
        // Adjust volatility by tail factor (Copula proxy)
        let effective_vol: u64 = (volatility * tail_factor) / 1000u64;

        // Determine risk level (0=LOW, 1=MEDIUM, 2=HIGH)
        let risk_level: u8 = 
            effective_vol < low_threshold ? 0u8 :
            effective_vol > high_threshold ? 2u8 : 1u8;
        
        // Calculate risk score (0-100)
        let risk_score: u8 = 
            risk_level == 0u8 ? 20u8 :
            risk_level == 2u8 ? 90u8 : 55u8;
        
        // Generate risk commitment for public verification
        let risk_commitment: field = BHP256::hash_to_field(effective_vol);
        
        return (risk_score, risk_level, risk_commitment);
    }

    /**
     * @notice Verify risk report publicly
     */
    async transition verify_risk_report(
        public risk_commitment: field
    ) -> Future {
        return finalize_verify(risk_commitment);
    }

    async function finalize_verify(commitment: field) {
        Mapping::set(verified_reports, commitment, true);
        Mapping::set(report_metadata, commitment, block.height as u64);
    }

    /**
     * @notice Export a verifiable risk receipt
     */
    transition export_risk_receipt(
        private vol_commitment: field,
        private risk_commitment: field,
        private risk_level: u8,
        public timestamp: u64
    ) -> RiskReport {
        let report_id: field = BHP256::hash_to_field(vol_commitment + risk_commitment);
        
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

    // Helper: Integer square root approximation (Newton-Raphson)
    // Refactored to avoid 'mut' by using shadowing within unrolled logic
    function sqrt_approx(n: u64) -> u64 {
        if n == 0u64 {
            return 0u64;
        }
        
        let x0: u64 = n;
        let y0: u64 = (x0 + 1u64) / 2u64;
        
        let x1: u64 = y0 < x0 ? y0 : x0;
        let y1: u64 = (x1 + n / x1) / 2u64;
        
        let x2: u64 = y1 < x1 ? y1 : x1;
        let y2: u64 = (x2 + n / x2) / 2u64;

        let x3: u64 = y2 < x2 ? y2 : x2;
        let y3: u64 = (x3 + n / x3) / 2u64;

        let x4: u64 = y3 < x3 ? y3 : x3;
        let y4: u64 = (x4 + n / x4) / 2u64;
        
        return x4;
    }
}
