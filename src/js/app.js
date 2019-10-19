App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

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
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
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
      
      return App.render();
    });
  },

  render: () => {
    let electionInstance;
    let loader = $('#loader');
    let content = $('#content');

    loader.show();
    content.hide();

    // Load account data 
    web3.eth.getCoinbase((err,account) => {
      if(err === null) {
        App.account = account;
        $("#accountAddress").html('Your Account : ' + account);
      }
    });

    // Load contract data 
    App.contracts.Election.deployed().then((instance) => {
      // Get and return the instance of the contract
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then((candidatesCount) => {
      let cadidatesResults = $('#candidatesResults');
      candidatesResults.empty();
      
      // Get candidate's data from contract 
      for (let index = 1; index <= candidatesCount; index++) {
        electionInstance.candidates(index).then((candidate) => {
          let id = candidate.id;
          let name = candidate.name;
          let voteCount = candidate.voteCount;

          // Render candidates Result
          let candidateTemplate = "<tr><th>"
          + id +
          "</th><td>"
          + name +
          "</td><td>"
          + voteCount +
          "</td></tr>";
          candidatesResults.append(candidateTemplate);
        });
      }

      loader.hide();
      content.show();
    }).catch((error) => {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
