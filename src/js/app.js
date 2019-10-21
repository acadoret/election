App = {
  web3Provider: null,
  contracts: {},

  init: async () => {
    // // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   let petsRow = $('#petsRow');
    //   let petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return App.initWeb3();
  },

  initWeb3: async () => {
    if (typeof web3 !== "undefined"){
      // If a web3 instance is already provided by Meta Mask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(App.web3Provider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: () => {
    $.getJSON("Election.json", (election) => {
      // Instance a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      
      App.listenForEvents();

      return App.getAccount();
    });
  },

  listenForEvents: () => {
    App.contracts.Election.deployed().then((instance) => {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((error, event) => {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.getAccount();
      });
    });
  },

  getAccount: () => {
    // Load account data
    web3.eth.getCoinbase((err, account) => { 
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        return App.render();
      }
    });
  },

  render: () => {
    let electionInstance;
    let loader = $("#loader");
    let content = $("#content");
  
    loader.show();
    content.hide();

    // Load contract data
    App.contracts.Election.deployed().then((instance) => {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then((candidatesCount) => {
      let candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
  
      let candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
  
      for (let i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then((candidate) => {
          let id = candidate[0];
          let name = candidate[1];
          let voteCount = candidate[2];
  
          // Render candidate Result
          let candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
  
          // Render candidate ballot option
          let candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch((error) => {
      console.warn(error);
    });
  },

  castVote: () => {
    let candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then((instance) => {
      return instance.vote(candidateId, { from: App.account });
    }).then((result) => {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch((err) => {
      console.error(err);
    });
  }
};



$(() => {
  $(window).load(() => {
    App.init();
  });
});
