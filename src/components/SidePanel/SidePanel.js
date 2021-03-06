import React, { Component } from "react";
import { Menu } from "semantic-ui-react";

import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

export default class SidePanel extends Component {
	render() {
		const { currentUser, primaryColor } = this.props;
		return (
			<Menu
				size="large"
				inverted
				fixed="left"
				vertical
				style={{ background: primaryColor, fontSize: "1.2rem" }}
			>
				<UserPanel
					currentUser={currentUser}
					primaryColor={primaryColor}
				></UserPanel>
				<Starred currentUser={currentUser}></Starred>
				<Channels currentUser={currentUser}></Channels>
				<DirectMessages currentUser={currentUser}></DirectMessages>
			</Menu>
		);
	}
}
