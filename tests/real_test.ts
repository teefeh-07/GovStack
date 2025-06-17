
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Test successful token validation with process-new-token",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('real', 'process-new-token', [types.principal(wallet1.address)], wallet1.address)
        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok u1)');
        assertEquals(block.height, 2);
    },
});

Clarinet.test({
    name: "Test successful token validation with process-new-token-alt",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('real', 'process-new-token-alt', [types.principal(wallet1.address)], wallet1.address)
        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok u1)');
        assertEquals(block.height, 2);
    },
});

Clarinet.test({
    name: "Test failed validation when token doesn't match tx-sender",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            Tx.contractCall('real', 'process-new-token', [types.principal(wallet2.address)], wallet1.address)
        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(err u2)'); // ERR-VALIDATION-FAILED
        assertEquals(block.height, 2);
    },
});

Clarinet.test({
    name: "Test read-only validate-principal function",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn('real', 'validate-principal', [types.principal(wallet1.address)], wallet1.address);
        assertEquals(result.result, 'true');

        // Test with null principal (should fail)
        result = chain.callReadOnlyFn('real', 'validate-principal', [types.principal('SP000000000000000000002Q6VF78')], wallet1.address);
        assertEquals(result.result, 'false');
    },
});

Clarinet.test({
    name: "Test read-only get-validation-status function",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;

        // Test with matching principal (should return true)
        let result = chain.callReadOnlyFn('real', 'get-validation-status', [types.principal(wallet1.address)], wallet1.address);
        assertEquals(result.result, '(ok true)');

        // Test with non-matching principal (should return false)
        result = chain.callReadOnlyFn('real', 'get-validation-status', [types.principal(wallet2.address)], wallet1.address);
        assertEquals(result.result, '(ok false)');
    },
});

Clarinet.test({
    name: "Test error handling for invalid principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('real', 'process-new-token', [types.principal('SP000000000000000000002Q6VF78')], wallet1.address)
        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(err u4)'); // ERR-INVALID-PRINCIPAL
        assertEquals(block.height, 2);
    },
});
