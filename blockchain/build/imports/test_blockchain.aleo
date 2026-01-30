import risk_proof_v1.aleo;
program test_blockchain.aleo;

function test_register_portfolio:
    call risk_proof_v1.aleo/register_portfolio 12345field 100u32 10u64 into r0;
    assert.eq r0.commitment 12345field;
    assert.eq r0.data_points 100u32;

function test_volatility_calculation:
    call risk_proof_v1.aleo/register_portfolio 12345field 100u32 10u64 into r0;
    call risk_proof_v1.aleo/compute_volatility r0 1000u64 100000u64 800000u64 4000000u64 10000u64 into r1 r2;
    gt r1 0u64 into r3;
    assert.eq r3 true;

constructor:
    assert.eq edition 0u16;
