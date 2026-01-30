program risk_proof_v1.aleo;

record PortfolioRecord:
    owner as address.private;
    commitment as field.private;
    timestamp as u64.private;
    data_points as u32.private;

record RiskReport:
    owner as address.private;
    report_id as field.private;
    volatility_commitment as field.private;
    risk_commitment as field.private;
    risk_level as u8.private;
    timestamp as u64.private;
    verified as boolean.private;

mapping verified_reports:
    key as field.public;
    value as boolean.public;

mapping report_metadata:
    key as field.public;
    value as u64.public;

function register_portfolio:
    input r0 as field.private;
    input r1 as u32.private;
    input r2 as u64.public;
    cast self.caller r0 r2 r1 into r3 as PortfolioRecord.record;
    output r3 as PortfolioRecord.record;

closure sqrt_approx:
    input r0 as u64;
    is.eq r0 0u64 into r1;
    add r0 1u64 into r2;
    div r2 2u64 into r3;
    lt r3 r0 into r4;
    ternary r4 r3 r0 into r5;
    div r0 r5 into r6;
    add r5 r6 into r7;
    div r7 2u64 into r8;
    lt r8 r5 into r9;
    ternary r9 r8 r5 into r10;
    div r0 r10 into r11;
    add r10 r11 into r12;
    div r12 2u64 into r13;
    lt r13 r10 into r14;
    ternary r14 r13 r10 into r15;
    div r0 r15 into r16;
    add r15 r16 into r17;
    div r17 2u64 into r18;
    lt r18 r15 into r19;
    ternary r19 r18 r15 into r20;
    div r0 r20 into r21;
    add r20 r21 into r22;
    div r22 2u64 into r23;
    ternary r1 0u64 r20 into r24;
    output r24 as u64;

function compute_volatility:
    input r0 as PortfolioRecord.record;
    input r1 as u64.private;
    input r2 as u64.private;
    input r3 as u64.private;
    input r4 as u64.private;
    input r5 as u64.private;
    assert.eq r0.owner self.caller;
    mul r2 r4 into r6;
    div r6 1000000u64 into r7;
    mul r3 r5 into r8;
    div r8 1000000u64 into r9;
    add r1 r7 into r10;
    add r10 r9 into r11;
    call sqrt_approx r11 into r12;
    mul r12 15874u64 into r13;
    div r13 1000u64 into r14;
    hash.bhp256 r14 into r15 as field;
    output r14 as u64.private;
    output r15 as field.private;

function compute_risk_score:
    input r0 as u64.private;
    input r1 as u64.private;
    input r2 as u64.private;
    input r3 as u64.private;
    mul r0 r1 into r4;
    div r4 1000u64 into r5;
    lt r5 r2 into r6;
    gt r5 r3 into r7;
    ternary r7 2u8 1u8 into r8;
    ternary r6 0u8 r8 into r9;
    is.eq r9 0u8 into r10;
    is.eq r9 2u8 into r11;
    ternary r11 90u8 55u8 into r12;
    ternary r10 20u8 r12 into r13;
    hash.bhp256 r5 into r14 as field;
    output r13 as u8.private;
    output r9 as u8.private;
    output r14 as field.private;

function verify_risk_report:
    input r0 as field.public;
    async verify_risk_report r0 into r1;
    output r1 as risk_proof_v1.aleo/verify_risk_report.future;

finalize verify_risk_report:
    input r0 as field.public;
    set true into verified_reports[r0];
    cast block.height into r1 as u64;
    set r1 into report_metadata[r0];

function export_risk_receipt:
    input r0 as field.private;
    input r1 as field.private;
    input r2 as u8.private;
    input r3 as u64.public;
    add r0 r1 into r4;
    hash.bhp256 r4 into r5 as field;
    cast self.caller r5 r0 r1 r2 r3 true into r6 as RiskReport.record;
    output r6 as RiskReport.record;

constructor:
    assert.eq edition 0u16;
