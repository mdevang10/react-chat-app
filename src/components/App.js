import React from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";

import "./App.css";
import ColorPanel from "../components/ColorPanel/ColorPanel";
import SidePanel from "../components/SidePanel/SidePanel";
import Messages from "../components/Messages/Messages";
import MetaPanel from "../components/MetaPanel/MetaPanel";

function App({ currentUser, currentChannel, isPrivateChannel, userPosts }) {
	return (
		<Grid columns="equal" className="app" style={{ background: "#eee" }}>
			<ColorPanel></ColorPanel>
			<SidePanel
				key={currentUser && currentUser.id}
				currentUser={currentUser}
			></SidePanel>
			<Grid.Column style={{ marginLeft: 320 }}>
				<Messages
					key={currentChannel && currentChannel.id}
					currentChannel={currentChannel}
					currentUser={currentUser}
					isPrivateChannel={isPrivateChannel}
				></Messages>
			</Grid.Column>
			<Grid.Column width={4}>
				<MetaPanel
					key={currentChannel && currentChannel.id}
					isPrivateChannel={isPrivateChannel}
					currentChannel={currentChannel}
					userPosts={userPosts}
				></MetaPanel>
			</Grid.Column>
		</Grid>
	);
}

const mapStateToProps = (state) => ({
	currentUser: state.user.currentUser,
	currentChannel: state.channel.currentChannel,
	isPrivateChannel: state.channel.isPrivateChannel,
	userPosts: state.channel.userPosts,
});

export default connect(mapStateToProps)(App);
