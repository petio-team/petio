import { NotifyEvent, NotifyPayload } from '@/services/notifications/types';

export const renderTemplate = (event: NotifyEvent, payload: NotifyPayload) => `
  <mjml>
    <mj-head>
      <mj-title>Petio - ${event} - ${payload.title}</mj-title>
      <mj-attributes>
        <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"></mj-all>
        <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"></mj-text>
      </mj-attributes>
      <mj-style inline="inline">
        .body-section {
        -webkit-box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
        -moz-box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
        box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
        }
      </mj-style>
      <mj-style inline="inline">
        .text-link {
        color: #5e6ebf
        }
      </mj-style>
      <mj-style inline="inline">
        .footer-link {
        color: #888888
        }
      </mj-style>
    </mj-head>
    <mj-body background-color="#D79B23" width="600px">
      <mj-section full-width="full-width" background-color="#111111" padding-bottom="0">
        <mj-column width="100%">
          <mj-text color="#D79B23" align="center" font-size="32px" padding="20px" font-weight="bold" text-transform="uppercase" letter-spacing="5px">
            Petio
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-wrapper padding-top="0" padding-bottom="0" css-class="body-section">
        <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
          <mj-column width="100%">
            <mj-text color="#212b35" font-weight="bold" font-size="20px">
            ${event}
            </mj-text>
            <mj-text color="#637381" font-size="16px" font-weight="bold">
              ${payload.title}
            </mj-text>
            <mj-text color="#637381" font-size="16px">
              ${payload.content}
            </mj-text>
            <mj-text color="#637381" font-size="16px">
              <ul style="list-style: none">
                <li style="padding-bottom: 5px"><strong>Requested By:</strong> ${payload.user?.username}</li>
                <li style="padding-bottom: 5px"><strong>Requested Date:</strong> ${payload.request?.createdAt}</li>
              </ul>
            </mj-text>
            <mj-image src="${payload.media?.image}" />
            <mj-button href="https://petio.tv" background-color="#D79B23" color="#111111">
              Review Request
            </mj-button>
          </mj-column>
        </mj-section>
      </mj-wrapper>
      <mj-wrapper full-width="full-width">
        <mj-section>
          <mj-column width="100%" padding="0">
            <mj-text color="#111111" font-size="11px" align="center" line-height="16px">
              &copy; Petio.tv., All Rights Reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-wrapper>
    </mj-body>
  </mjml>`;
