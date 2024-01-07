import typo from '../styles/components/typography.module.scss';

export default function MyIssues({ issues, userId }) {
  const userIssues = issues.filter((issue) => issue.user === userId);
  if (userIssues.length === 0)
    return <p className={typo.body}>No active issues</p>;
  return (
    <div className="test">
      {userIssues.map((issue) => {
        return (
          <p key={`myissues__${issue._id}`} className={typo.body}>
            <b>{issue.title}:</b> {formatIssue(issue.issue)}
          </p>
        );
      })}
    </div>
  );
}

function formatIssue(issue) {
  switch (issue) {
    case 'season':
      return 'Missing Season';
    case 'subs':
      return 'Missing Subtitles';
    case 'bad-video':
      return 'Bad Quality / Video Issue';
    case 'bad-audio':
      return 'Audio Issue / Audio Sync';
    case 'other':
      return 'Other';
    default:
      return '';
  }
}
