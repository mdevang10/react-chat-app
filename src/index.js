import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	withRouter,
} from "react-router-dom";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";

import "semantic-ui-css/semantic.min.css";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Spinner from "./Spinner";
import firebase from "./firebaseConfig";

import rootReducer from "./reducers/index";
import { setUser, clearUser } from "./actions/index";

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {
	componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				// console.log(user);
				this.props.setUser(user);
				this.props.history.push("/");
			} else {
				this.props.history.push("/login");
				this.props.clearUser();
			}
		});
	}

	render() {
		return this.props.isLoading ? (
			<Spinner></Spinner>
		) : (
			<React.StrictMode>
				<Switch>
					<Route path="/" exact component={App}></Route>
					<Route path="/login" component={Login}></Route>
					<Route path="/register" component={Register}></Route>
				</Switch>
			</React.StrictMode>
		);
	}
}

const mapStateToProps = (state) => ({
	isLoading: state.user.isLoading,
});

const RootWithAuth = withRouter(
	connect(mapStateToProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<RootWithAuth></RootWithAuth>
		</Router>
	</Provider>,
	document.getElementById("root")
);

serviceWorker.unregister();
