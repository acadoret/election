let Election = artifacts.require("./Election.sol");

contract("Election", (accounts) => {

    it("initializes with two candidates", () => {
        return Election.deployed().then((instance) => {
            return instance.candidatesCount();
        }).then((count) => {
            assert.equal(count,2);
        });
    });

    it("It initilizes the candidates with the correct values", () => {
        return Election.deployed().then((instance) => {
            electionInstance = instance;
            return electionInstance.candidates(1);
        }).then((candidate) => {
            assert.equal(candidate.id, 1, "Contains the correct id");
            assert.equal(candidate.name, "Candidate 1", "Contains the correct name");
            assert.equal(candidate.voteCount, 0, "Contains the correct vote count");
            return electionInstance.candidates(2);
        }).then((candidate) => {
            assert.equal(candidate.id, 2, "Contains the correct id");
            assert.equal(candidate.name, "Candidate 2", "Contains the correct name");
            assert.equal(candidate.voteCount, 0, "Contains the correct vote count");
        });
        
    });

});