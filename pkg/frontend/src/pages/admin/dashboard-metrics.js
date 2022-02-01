import { connect } from "react-redux";
import styles from "../../styles/views/admin.module.scss";
import typo from "../../styles/components/typography.module.scss";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { getBandwidth, getServerDetails } from "../../services/plex.service";

const mapStateToProps = (state) => {
  return {
    system: state.system,
  };
};

function Metrics({ system }) {
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [isHover, setIsHover] = useState(false);
  useEffect(() => {
    async function updateServerDetails() {
      if (!liveUpdate || isHover) return;
      try {
        await getServerDetails();
      } catch (e) {
        console.log(e);
        setLiveUpdate(false);
      }
    }

    async function updateBandwidth() {
      if (!liveUpdate || isHover) return;
      try {
        await getBandwidth();
      } catch (e) {
        console.log(e);
        setLiveUpdate(false);
      }
    }

    let interval = false;
    let intervalBandwidth = false;

    if (liveUpdate || !isHover) {
      updateServerDetails();
      updateBandwidth();
      interval = setInterval(() => {
        updateServerDetails();
      }, 10000);

      intervalBandwidth = setInterval(() => {
        updateBandwidth();
      }, 2000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(intervalBandwidth);
    };
  }, [liveUpdate, isHover]);

  let cpuData = false;
  let ramData = false;
  let bandwidthData = false;

  if (system.server) {
    cpuData = [
      {
        name: "Plex",
        value: system.server.processCpuUtilization || 0,
      },
      {
        name: "System",
        value:
          system.server.processCpuUtilization &&
          system.server.processCpuUtilization
            ? system.server.hostCpuUtilization -
              system.server.processCpuUtilization
            : 0,
      },
      {
        name: "Free",
        value:
          system.server.processCpuUtilization &&
          system.server.processCpuUtilization
            ? 100 -
              (system.server.processCpuUtilization +
                system.server.hostCpuUtilization)
            : 100,
      },
    ];
    ramData = [
      {
        name: "Plex",
        value: system.server.processMemoryUtilization || 0,
      },
      {
        name: "System",
        value:
          system.server.processMemoryUtilization &&
          system.server.processMemoryUtilization
            ? system.server.hostMemoryUtilization -
              system.server.processMemoryUtilization
            : 0,
      },
      {
        name: "Free",
        value:
          system.server.processMemoryUtilization &&
          system.server.processMemoryUtilization
            ? 100 -
              (system.server.processMemoryUtilization +
                system.server.hostMemoryUtilization)
            : 100,
      },
    ];
  }

  if (system.bandwidth) {
    bandwidthData = system.bandwidth;
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 bps";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["bps", "Kbps", "Mbps", "Gbps", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.dashboard__metrics__graph__tooltip}>
          <p
            className={`${typo.body} ${typo.bold}`}
          >{`${payload[0].payload.name} ago`}</p>
          <div className={styles.dashboard__metrics__graph__tooltip__remote}>
            <p className={`${typo.body} ${typo.bold}`}>
              Remote: {formatBytes(payload[0].value, 0)}
            </p>
          </div>
          <div className={styles.dashboard__metrics__graph__tooltip__local}>
            <p className={`${typo.body} ${typo.bold}`}>
              Local: {formatBytes(payload[1].value, 0)}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.dashboard__metrics__wrap}>
      <div className={styles.dashboard__metrics__activity}>
        <div className={styles.dashboard__module}>
          <p
            className={`${styles.dashboard__metrics__graph__line__title} ${typo.body} ${typo.bold}`}
          >
            Bandwidth{" "}
            <span className={typo.small}>
              {system.bandwidth && system.bandwidth[system.bandwidth.length - 1]
                ? `(${formatBytes(
                    system.bandwidth[system.bandwidth.length - 1].Remote +
                      system.bandwidth[system.bandwidth.length - 1].Local,
                    0
                  )})`
                : null}
            </span>
          </p>
          <div className={styles.dashboard__metrics__activity__inner}>
            <div
              className={styles.dashboard__metrics__graph__line}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              onTouchStart={() => setIsHover(true)}
              onTouchEnd={() => setIsHover(true)}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {bandwidthData ? (
                <ResponsiveContainer>
                  <LineChart data={system.bandwidth}>
                    <Line
                      type="monotone"
                      dataKey="Remote"
                      stroke="#8884d8"
                      strokeWidth={5}
                      name="Remote"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Local"
                      stroke="#8884d8"
                      strokeWidth={5}
                      name="Local"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.dashboard__metrics__cpu}>
        <div className={styles.dashboard__module}>
          <div className={styles.dashboard__metrics__cpu__inner}>
            <div className={styles.dashboard__metrics__graph}>
              <p
                className={`${styles.dashboard__metrics__graph__title} ${typo.body} ${typo.bold}`}
              >
                CPU
              </p>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={cpuData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.dashboard__metrics__ram}>
        <div className={styles.dashboard__module}>
          <div className={styles.dashboard__metrics__ram__inner}>
            <div className={styles.dashboard__metrics__graph}>
              <p
                className={`${styles.dashboard__metrics__graph__title} ${typo.body} ${typo.bold}`}
              >
                Memory
              </p>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={ramData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Metrics);
