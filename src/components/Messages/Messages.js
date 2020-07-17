import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions/index";

import firebase from "../../firebaseConfig";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends Component {
	state = {
		privateChannel: this.props.isPrivateChannel,
		privateMessagesRef: firebase.database().ref("privateMessages"),
		messages: [],
		messagesRef: firebase.database().ref("messages"),
		channel: this.props.currentChannel,
		isChannelStarred: false,
		user: this.props.currentUser,
		usersRef: firebase.database().ref("users"),
		numUniqueUsers: "",
		searchTerm: "",
		searchResults: [],
		searchLoading: false,
		messagesLoading: true,
		progressBar: false,
	};

	componentDidMount() {
		const { channel, user } = this.state;
		if (channel && user) {
			this.addListeners(channel.id);
			this.addUsersStarsListeners(channel.id, user.uid);
		}
	}

	addListeners = (channelId) => {
		this.addMessageListner(channelId);
	};

	addMessageListner = (channelId) => {
		let loadedMessages = [];
		const ref = this.getMessagesRef();
		ref.child(channelId).on("child_added", (snap) => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false,
			});
			this.countUniqueUsers(loadedMessages);
			this.countUserPosts(loadedMessages);
		});
	};

	addUsersStarsListeners = (channelId, userId) => {
		this.state.usersRef
			.child(userId)
			.child("starred")
			.once("value")
			.then((data) => {
				if (data.val() !== null) {
					const channelIds = Object.keys(data.val());
					const prevStarred = channelIds.includes(channelId);
					this.setState({
						isChannelStarred: prevStarred,
					});
				}
			});
	};

	displayMessages = (messages) => {
		return (
			messages.length > 0 &&
			messages.map((message) => (
				<Message
					key={message.timeStamp}
					message={message}
					user={this.state.user}
				></Message>
			))
		);
	};

	isProgressBarVisible = (percent) => {
		if (percent > 0) {
			this.setState({
				progressBar: true,
			});
		}
	};

	displayChannelName = (channel) => {
		return channel
			? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
			: "";
	};

	countUniqueUsers = (messages) => {
		const uniqueUsers = messages.reduce((acc, message) => {
			if (!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
		const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
		this.setState({
			numUniqueUsers: numUniqueUsers,
		});
	};

	countUserPosts = (messages) => {
		let userPosts = messages.reduce((acc, message) => {
			if (message.user.name in acc) {
				acc[message.user.name].count += 1;
			} else {
				acc[message.user.name] = {
					avatar: message.user.avatar,
					count: 1,
				};
			}
			return acc;
		}, {});
		console.log(userPosts);
		this.props.setUserPosts(userPosts);
	};

	getMessagesRef = () => {
		const { messagesRef, privateMessagesRef, privateChannel } = this.state;
		return privateChannel ? privateMessagesRef : messagesRef;
	};

	handleSearchChange = (event) => {
		this.setState(
			{
				searchTerm: event.target.value,
				searchLoading: true,
			},
			() => this.handleSearchMessages()
		);
	};

	handleSearchMessages = () => {
		const channelMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, "gi");
		const searchResults = channelMessages.reduce((acc, message) => {
			if (
				(message.content && message.content.match(regex)) ||
				message.user.name.match(regex)
			) {
				acc.push(message);
			}
			return acc;
		}, []);
		this.setState({
			searchResults: searchResults,
		});
		setTimeout(() => this.setState({ searchLoading: false }), 1000);
	};

	handleStar = () => {
		this.setState(
			(prevState) => ({
				isChannelStarred: !prevState.isChannelStarred,
			}),
			() => this.starChannel()
		);
	};

	starChannel = () => {
		if (this.state.isChannelStarred) {
			this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
				[this.state.channel.id]: {
					name: this.state.channel.name,
					details: this.state.channel.details,
					createdBy: {
						name: this.state.channel.createdBy.name,
						avatar: this.state.channel.createdBy.avatar,
					},
				},
			});
		} else {
			this.state.usersRef
				.child(`${this.state.user.uid}/starred`)
				.child(this.state.channel.id)
				.remove((err) => {
					if (err !== null) {
						console.log(err);
					}
				});
		}
	};

	render() {
		const {
			messagesRef,
			channel,
			user,
			messages,
			progressBar,
			numUniqueUsers,
			searchTerm,
			searchResults,
			searchLoading,
			privateChannel,
			isChannelStarred,
		} = this.state;
		return (
			<>
				<MessagesHeader
					channelName={this.displayChannelName(channel)}
					numUniqueUsers={numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
					isPrivateChannel={privateChannel}
					handleStar={this.handleStar}
					isChannelStarred={isChannelStarred}
				></MessagesHeader>
				<Segment>
					<Comment.Group
						className={
							progressBar ? "messages__progress" : "messages"
						}
					>
						{searchTerm
							? this.displayMessages(searchResults)
							: this.displayMessages(messages)}
					</Comment.Group>
				</Segment>
				<MessageForm
					messagesRef={messagesRef}
					currentChannel={channel}
					currentUser={user}
					isProgressBarVisible={this.isProgressBarVisible}
					isPrivateChannel={privateChannel}
					getMessagesRef={this.getMessagesRef}
				></MessageForm>
			</>
		);
	}
}

export default connect(null, { setUserPosts })(Messages);
