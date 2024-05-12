import { useState } from 'react';

import { addIssue } from '../services/user.service';
import buttons from '../styles/components/button.module.scss';
import inputs from '../styles/components/input.module.scss';
import modal from '../styles/components/modal.module.scss';
import typo from '../styles/components/typography.module.scss';

export default function IssueModal({
  data,
  type,
  issuesOpen,
  setIssuesOpen,
  newNotification,
  currentUser,
}) {
  const [issueType, setIssueType] = useState('');
  const [detail, setDetail] = useState('');

  async function submit() {
    if (!issueType) {
      newNotification({
        type: 'error',
        message: 'Please pick an option',
      });
      return;
    }

    try {
      await addIssue({
        mediaId: data.id,
        type: type,
        title: data.name || data.title,
        user: currentUser.id,
        issue: issueType,
        comment: detail,
      });
      setIssueType('');
      setDetail('');
      setIssuesOpen(false);
      newNotification({
        type: 'success',
        message: `Issue added for ${data.name || data.title}`,
      });
    } catch {
      newNotification({
        type: 'error',
        message: 'Failed to add issue',
      });
    }
  }

  if (!issuesOpen || !data) return null;
  return (
    <div className={modal.wrap}>
      <div className={modal.main}>
        <div className={modal.close}>
          <p
            className={`${typo.small} ${typo.uppercase} ${typo.medium}`}
            onClick={() => setIssuesOpen(false)}
          >
            Close
          </p>
        </div>
        <div className={modal.title}>
          <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
            Report an issue
          </p>
        </div>
        <div className={modal.content}>
          <p className={`${typo.body}`}>
            Reporting an issue for:{' '}
            <span className={`${typo.bold}`}>{data.title || data.name}</span>
          </p>
          <br />
          <p className={typo.small}>
            We try our best to provide good quality content without any
            problems, but sometimes things go wrong. Please use this form to let
            us know of any issues you've had whilst watching Plex and we will do
            our best to fix them!
          </p>
          <br />
          <p className={typo.body}>
            Please fill out the fields below relating to the issue you are
            having with this {type === 'tv' ? 'TV Show' : 'Movie'}.
          </p>
          <br />

          <select
            className={inputs.select__light}
            name="option"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="">Choose an option</option>
            {type === 'movie' ? (
              <>
                <option value="subs">Missing Subtitles</option>
                <option value="bad-video">Bad Quality / Video Issue</option>
                <option value="bad-audio">Audio Issue / Audio Sync</option>
              </>
            ) : (
              <>
                <option value="episodes">Missing Episodes</option>
                <option value="season">Missing Season</option>
                <option value="subs">Missing Subtitles</option>
                <option value="bad-video">Bad Quality / Video Issue</option>
                <option value="bad-audio">Audio Issue / Audio Sync</option>
              </>
            )}
            <option value="other">Other, please specify</option>
          </select>
          <br />
          <textarea
            className={inputs.textarea__light}
            value={detail}
            placeholder="Notes"
            name="detail"
            onChange={(e) => setDetail(e.target.value)}
          ></textarea>
          <br />
          <button
            style={{ marginTop: 'auto' }}
            className={`${buttons.primary} ${
              !detail || !issueType ? 'disabled' : ''
            }`}
            disabled={!issueType}
            onClick={submit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
