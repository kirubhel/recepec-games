'use client';

import axios from 'axios';

interface XapiStatement {
  actor: {
    name: string;
    openid: string;
  };
  verb: {
    id: string;
    display: { [key: string]: string };
  };
  object: {
    id: string;
    definition: {
      name: { [key: string]: string };
      description: { [key: string]: string };
    };
  };
  result?: {
    score?: {
      min: number;
      max: number;
      raw: number;
      scaled: number;
    };
    completion?: boolean;
    success?: boolean;
    duration?: string;
  };
}

export const reportProgress = async (
  launchInfo: any,
  gameData: { id: string; title: string },
  result: { score: number; maxScore: number; success: boolean }
) => {
  if (!launchInfo.endpoint || !launchInfo.auth) {
    console.warn('RESPECT: No reporting endpoint or auth token found. Skipping reporting.');
    return;
  }

  const statement: XapiStatement = {
    actor: {
      name: launchInfo.givenName || 'Student',
      openid: launchInfo.auth, // Using auth token as identifier for now
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' },
    },
    object: {
      id: `https://learningcloud.et/games/${gameData.id}`,
      definition: {
        name: { 'en-US': gameData.title },
        description: { 'en-US': `Educational game: ${gameData.title}` },
      },
    },
    result: {
      score: {
        min: 0,
        max: result.maxScore,
        raw: result.score,
        scaled: result.score / result.maxScore,
      },
      completion: true,
      success: result.success,
    },
  };

  try {
    console.log('RESPECT: Sending xAPI statement...', statement);
    const response = await axios.post(launchInfo.endpoint, statement, {
      headers: {
        'Authorization': `Bearer ${launchInfo.auth}`,
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.3',
      },
    });
    return response.data;
  } catch (err) {
    console.error('RESPECT: Failed to send xAPI statement:', err);
  }
};
