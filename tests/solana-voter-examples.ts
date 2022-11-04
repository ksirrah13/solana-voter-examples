import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaVoterExamples } from "../target/types/solana_voter_examples";

describe("solana-voter-examples", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaVoterExamples as Program<SolanaVoterExamples>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
