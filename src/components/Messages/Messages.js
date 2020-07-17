import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions/index";

import firebase from "../../firebaseConfig";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

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
		typingRef: firebase.database().ref("typing"),
		typingUsers: [],
		connectedRef: firebase.database().ref(".info/connected"),
		listeners: [],
	};

	componentDidMount() {
		const { channel, user, listeners } = this.state;
		if (channel && user) {
			this.removeListners(listeners);
			this.addListeners(channel.id);
			this.addUsersStarsListeners(channel.id, user.uid);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.MessagesEnd) {
			this.scrollToBottom();
		}
	}

	componentWillUnmount() {
		this.removeListners(this.state.listeners);
		this.state.connectedRef.off()
	}

	scrollToBottom = () => {
		this.MessagesEnd.scrollIntoView({ behavior: "smooth" });
	};

	removeListners = (listeners) => {
		listeners.forEach((listner) => {
			listner.ref.child(listner.id).off(listner.event);
		});
	};

	addToListners = (id, ref, event) => {
		const index = this.state.listeners.findIndex((listner) => {
			return (
				listner.id === id &&
				listner.ref === ref &&
				listner.event === event
			);
		});
		if (index !== -1) {
			const newListener = { id, ref, event };
			this.setState({
				listeners: this.state.listeners.concat(newListener),
			});
		}
	};

	addListeners = (channelId) => {
		this.addMessageListner(channelId);
		this.addTypingListners(channelId);
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
		this.addToListners(channelId, ref, "child_added");
	};

	addTypingListners = (channelId) => {
		let typingUsers = [];
		this.state.typingRef.child(channelId).on("child_added", (snap) => {
			if (snap.key !== this.state.user.uid) {
				typingUsers = typingUsers.concat({
					id: snap.key,
					name: snap.val(),
				});
				this.setState({
					typingUsers: typingUsers,
				});
			}
		});
		this.addToListners(channelId, this.state.typingRef, "child_added");

		this.state.typingRef.child(channelId).on("child_removed", (snap) => {
			const index = typingUsers.findIndex((user) => user.id === snap.key);
			if (index !== -1) {
				typingUsers = typingUsers.filter(
					(user) => user.id !== snap.key
				);
				this.setState({
					typingUsers: typingUsers,
				});
			}
		});
		this.addToListners(channelId, this.state.typingRef, "child_removed");

		this.state.connectedRef.on("value", (snap) => {
			if (snap.val() === true) {
				this.state.typingRef
					.child(channelId)
					.child(this.state.user.uid)
					.onDisconnect()
					.remove((err) => {
						if (err !== null) {
							console.log(err);
						}
					});
			}
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

	displayMessagesSkeleton = (loading) =>
		loading ? (
			<React.Fragment>
				{[...Array(10)].map((_, i) => (
					<Skeleton key={i}></Skeleton>
				))}
			</React.Fragment>
		) : null;

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

	displayTypingUsers = (users) =>
		users.length > 0 &&
		users.map((user) => (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					marginBottom: "0.2em",
				}}
				key={user.id}
			>
				<span className="user__typing">{user.name} is typing</span>{" "}
				<Typing />
			</div>
		));

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
			typingUsers,
			messagesLoading,
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
						{this.displayMessagesSkeleton(messagesLoading)}
						{searchTerm
							? this.displayMessages(searchResults)
							: this.displayMessages(messages)}
						{this.displayTypingUsers(typingUsers)}
						<div ref={(node) => (this.MessagesEnd = node)}></div>
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
