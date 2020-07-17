import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends Component {
	state = {
		file: null,
		authorized: ["image/jpeg", "image/png"],
	};

	addFile = (event) => {
		const file = event.target.files[0];
		if (file) {
			this.setState({
				file: file,
			});
		}
	};

	isAuthorized = (fileName) =>
		this.state.authorized.includes(mime.lookup(fileName));

	clearFile = () => {
		this.setState({
			file: null,
		});
	};

	sendFile = () => {
		const { file } = this.state;
		const { uploadFile, closeModal } = this.props;

		if (file !== null) {
			if (this.isAuthorized(file.name)) {
				const metadata = { contentType: mime.lookup(file.name) };
				uploadFile(file, metadata);
				closeModal();
				this.clearFile();
			}
		}
	};

	render() {
		const { modal, closeModal } = this.props;

		return (
			<Modal basic open={modal} onClose={closeModal}>
				<Modal.Header>Select an Image File</Modal.Header>
				<Modal.Content>
					<Input
						fluid
						label="File types: jpg, png"
						name="file"
						type="file"
						onChange={this.addFile}
					></Input>
				</Modal.Content>
				<Modal.Actions>
					<Button inverted color="green" onClick={this.sendFile}>
						<Icon name="checkmark"></Icon>Send
					</Button>
					<Button inverted color="red" onClick={closeModal}>
						<Icon name="remove"></Icon>Cancel
					</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default FileModal;
