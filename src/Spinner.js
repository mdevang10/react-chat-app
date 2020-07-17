import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

export default function Spinner() {
	return (
		<Dimmer active>
			<Loader size="small" content={"preparing chat"}></Loader>
		</Dimmer>
	);
}
