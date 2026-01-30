// The 'test_blockchain' test program.
import risk_proof_v1.aleo;

program test_blockchain.aleo {
    @test
    transition test_register_portfolio() {
        let commitment: field = 12345field;
        let data_points: u32 = 100u32;
        let timestamp: u64 = 10u64;
        let p_record: risk_proof_v1.aleo/PortfolioRecord = risk_proof_v1.aleo/register_portfolio(commitment, data_points, timestamp);
        assert_eq(p_record.commitment, commitment);
        assert_eq(p_record.data_points, data_points);
    }

    @test
    transition test_volatility_calculation() {
        // Register a portfolio to get a record
        let commitment: field = 12345field;
        let data_points: u32 = 100u32;
        let timestamp: u64 = 10u64;
        let portfolio: risk_proof_v1.aleo/PortfolioRecord = risk_proof_v1.aleo/register_portfolio(commitment, data_points, timestamp);

        // GARCH inputs (scaled by 10^6)
        let omega: u64 = 1000u64;
        let alpha: u64 = 100000u64;
        let beta: u64 = 800000u64;
        let return_sq: u64 = 4000000u64;
        let prev_var: u64 = 10000u64;

        let result: (u64, field) = risk_proof_v1.aleo/compute_volatility(portfolio, omega, alpha, beta, return_sq, prev_var);
        assert(result.0 > 0u64);
    }

    @noupgrade
    async constructor() {}
}
