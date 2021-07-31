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

class Cpu extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let height = window.innerWidth >= 992 ? 300 : 200;
		let margin =
			window.innerWidth >= 992
				? { top: 10, right: 0, left: -40, bottom: 0 }
				: { top: 10, right: 0, left: -60, bottom: 0 };
		const formatter = (value) => value;
		return (
			<ResponsiveContainer width="100%" height={height}>
				<LineChart data={this.props.cpu} margin={margin}>
					<XAxis dataKey="at" />
					<YAxis
						tickFormatter={formatter}
						allowDecimals={false}
						ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
						interval={0}
					/>
					<CartesianGrid />
					<Tooltip />
					<Legend iconType="circle" align="right" />
					<Line
						type="monotone"
						dataKey="processCpuUtilization"
						stroke="#9ad186"
						dot={false}
						strokeWidth={2}
						activeDot={{ r: 8 }}
						isAnimationActive={false}
						name="Plex"
					/>
					<Line
						type="monotone"
						dataKey="hostCpuUtilization"
						stroke="#f1335e"
						dot={false}
						strokeWidth={2}
						isAnimationActive={false}
						name="System"
					/>
				</LineChart>
			</ResponsiveContainer>
		);
	}
}

export default Cpu;
