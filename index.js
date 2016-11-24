// Action creators
function fetched(repos) {
  return {
    type: "FETCHED",
    loading: false,
    err: null,
    repos
  };
}

function fetching(loading) {
  return {
    type: "FETCHING",
    loading
  };
}

function changeGitUser(user) {
  console.log(user);
  return {
    type: "CHANGE_USER",
    user
  }
}

function requestError(err) {
  return {
    type: "ERROR",
    err
  }
}

// returns a function and will be called in the Redux-Thunk middleware
function loadReposAction() {
  return function(dispatch, getState) {
    const { user } =  getState();
    const url = "https://api.github.com/users/" + user + "/repos"; 
    dispatch(fetching(true)); //Loading
    return fetch(url)
      .then(function(result) { 
        if (result.status === 200) {
            return result.json();
        } 
       throw "error on request";
      })
      .then(function(json){
        dispatch(fetching(false)); //Stop Loading
        return dispatch(fetched(json));  
      })
      .catch(function(err) {      
        const errorMessage = "Oops..., Couldn't fetch repos for user: " + user;
        console.error(err);
        return dispatch(requestError(errorMessage));
      });
  }
}

// Reducers
const initialState = { loading: false, repos: [], user: 'papesdiop', err: null };

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case "FETCHING":
      return { ...state, loading: action.loading }
    case "FETCHED":
      return { ...state, repos: action.repos }
    case "ERROR":
      return { ...state, err: action.err }
    case "CHANGE_USER":
      return { ...state, user: action.user }
    default:
      return state;
  }
}

const { applyMiddleware, createStore } = Redux;
const thunk = ReduxThunk.default;
const { Provider, connect } = ReactRedux;

 // Store 
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(rootReducer);

//Our store listener but not relevant
store.subscribe(function() {
  //We can track here any state change
});

//Stateless React Component pure-function
const HeaderGitRepos = () => {
    return (<div><h1 style={{color: 'brown'}}> Welcome to React-Redux-Thunk Hack </h1></div>)
}

//React component with ES6 class
class GitReposComponent extends React.Component { 

    render(){      
      const { loading, user, repos, err } = this.props;
      if(!!loading){
        return (err) ? (<h1> {err} </h1>):(<h1> Loading... </h1>);
      }
      const prepareLine = (repo) => (<li key={repo.name}> { repo.name } </li>);
      const line = repos.map(prepareLine);
      return (<div>
          <HeaderGitRepos />
          <input type="text" placeholder="git username for ex. gaearon" onBlur={this.changeGitUser} />
          <button onClick={this.clickRefresh}> Fetch </button>
          <h3> ({user}) repositories </h3>
          <ul>{line}</ul>
        </div>);
    }
  
    clickRefresh = () => {
      store.dispatch(loadReposAction());
    };

    changeGitUser = (e) => {
      store.dispatch(changeGitUser(e.target.value));
    };

    componentDidMount() {
      //dispatch api request action
      store.dispatch(loadReposAction());   
    }
  
};

//Higher-order React Component creation a.k.a Container
const GitReposContainer = connect(
                            function(state) { 
                              return {                      
                                ...state
                               }
                             }
                          )(GitReposComponent);


//DOM
ReactDOM.render(
  <Provider store={store} >
    <GitReposContainer />
  </Provider>,
  document.getElementById('root')
);
