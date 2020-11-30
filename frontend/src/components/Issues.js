import React from 'react';
import { withRouter, Link } from 'react-router-dom';

class Issues extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id: false,
			open: this.props.open,
			type: '',
		};
	}

	componentWillUnmount() {
		this.props.close();
	}

	componentDidUpdate() {
		if (this.state.id !== this.props.match.params.id) {
			let type;
			switch (this.props.match.path) {
				case '/movie/:id':
					type = 'movie';
					break;
				case '/series/:id':
					type = 'series';
					break;
				default:
					type = 'unknown';
			}
			this.props.close();
			this.setState({
				id: this.props.match.params.id,
				type: type,
			});
		}

		if (this.props.open !== this.state.open) {
			this.setState({
				open: this.props.open,
			});
		}
	}

	render() {
		return (
			<div className={`issue-sidebar ${this.state.open ? 'open' : ''}`}>
				<button
					className="issue-sidebar--close"
					onClick={this.props.close}
				></button>
				<p className="main-title mb--2">Report an issue</p>
				<section>
					<p>
						We try our best to provide good quality content without
						any problems, but sometimes things go wrong. Please use
						this form to let us know of any issues you've had whilst
						watching Plex and we will do our best to fix them!
					</p>
				</section>
				<section>
					<p className="sub-title mb--1">Details</p>
					<input
						type="hidden"
						name="id"
						defaultValue={this.state.id}
					/>
					<input
						type="text"
						name="type"
						defaultValue={this.state.type}
					/>
					<input
						type="text"
						name="title"
						value={this.state.id}
						readOnly
					/>
					<select>
						<option value="">Choose an option</option>
						<option value="1">Issue type 1</option>
						<option value="2">Issue type 1</option>
					</select>
					<textarea defaultValue="Notes"></textarea>
				</section>
				<button className="btn btn__square">Submit</button>
			</div>
		);
	}
}

export default withRouter(Issues);
