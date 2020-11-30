import React from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

class Bandwidth extends React.Component {
	constructor(props) {
		super(props);
	}

	formatBytes(bytes, decimals = 2) {
		if (bytes === 0) return '';

		const k = 1000;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = [
			'bps',
			'kbps',
			'mbps',
			'gbps',
			'tbps',
			'pbps',
			'-',
			'-',
			'-',
		];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
	}

	render() {
		let height = window.innerWidth >= 992 ? 300 : 200;
		let margin =
			window.innerWidth >= 992
				? { top: 10, right: 0, left: -15, bottom: 0 }
				: { top: 10, right: 0, left: -60, bottom: 0 };
		const formatter = (value) => `${this.formatBytes(value)}`;
		// const formatter = (value) => value;
		return (
			<ResponsiveContainer width="100%" height={height}>
				<LineChart data={this.props.bandwidth} margin={margin}>
					<XAxis
						dataKey="name"
						ticks={['2m0s', '1m30s', '1m0s', '30s', '0s']}
					/>
					<YAxis tickFormatter={formatter} allowDecimals={false} />
					<CartesianGrid />
					<Legend iconType="circle" align="right" />
					<Tooltip />
					<Line
						type="monotone"
						dataKey="Local"
						stroke="#e69f23"
						dot={false}
						strokeWidth={2}
						activeDot={{ r: 8 }}
						isAnimationActive={false}
					/>
					<Line
						type="monotone"
						dataKey="Remote"
						stroke="#366dfc"
						isAnimationActive={false}
						dot={false}
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		);
	}
}

export default Bandwidth;
