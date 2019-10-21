 pragma solidity 0.5.11;

contract Election {
    // Model a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;
    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store voters count
    uint public votersCount;

    // Constructor
    constructor() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    // Define event
    event votedEvent (
        uint indexed _candidateId
    );

    function addCandidate(string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender],"Voter can't vote twice");
        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Your vote doesn't match witch any candidate");
        // record that voter has voted
        voters[msg.sender] = true;
        votersCount ++;
        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
        // trigger voted event
        emit votedEvent(_candidateId);
    }
}