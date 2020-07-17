import React, { Component } from "react";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import firebase from "../../firebaseConfig";

class UserPanel extends Component {
	state = {
		user: this.props.currentUser,
	};

	dropDownOptions = () => [
		{
			key: "user",
			text: (
				<span>
					signed in as <strong>{this.state.user.displayName}</strong>
				</span>
			),
			disabled: true,
		},
		{ key: "avatar", text: <span> Change Avatar</span> },
		{
			key: "signout",
			text: <span onClick={this.handleSignOut}> Sign Out</span>,
		},
	];

	handleSignOut = () => {
		firebase
			.auth()
			.signOut()
			.then(() => console.log("signed out!!!"));
	};

	render() {
		const { user } = this.state;
		return (
			<Grid style={{ background: "#4c3c4c" }}>
				<Grid.Column>
					<Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
						{/* App Header */}
						<Header inverted floated="left" as="h2">
							<Icon name="code"></Icon>
							<Header.Content>DevChat</Header.Content>
						</Header>
						{/* User DropDown */}
						<Header
							inverted
							as="h4"
							style={{ paddding: "0.25rem" }}
						>
							<Dropdown
								trigger={
									<span>
										<Image
											src={user.photoURL}
											spaced="right"
											avatar
										></Image>{" "}
										{user.displayName}
									</span>
								}
								options={this.dropDownOptions()}
							></Dropdown>
						</Header>
					</Grid.Row>
				</Grid.Column>
			</Grid>
		);
	}
}

export default UserPanel;
