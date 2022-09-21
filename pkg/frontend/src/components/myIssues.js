import typo from '../styles/components/typography.module.scss';

// import styles from '../styles/views/myAccount.module.scss';

export default function MyIssues({ issues, userId }) {
  const userIssues = issues.filter((issue) => issue.user === userId);
  if (userIssues.length === 0)
    return <p className={typo.body}>No active issues</p>;
  return (
    <div className="test">
      {userIssues.map((issue) => {
        return (
          <p className={typo.body}>
            <b>{issue.title}:</b> {toTitleCase(issue.issue)}
          </p>
        );
      })}
    </div>
  );
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
