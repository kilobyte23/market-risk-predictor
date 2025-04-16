import React from 'react';
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import Sentiment from 'sentiment';

interface NewsItem {
  title: string;
  content: string;
  date: string;
  source: string;
}

const mockNews: NewsItem[] = [
  {
    title: "Tech Sector Faces Unprecedented Challenges",
    content: "Major tech companies are struggling with market conditions and layoffs are becoming more frequent.",
    date: "2024-03-15",
    source: "Market Watch"
  },
  {
    title: "Supply Chain Disruptions Continue to Impact Industry",
    content: "Global supply chain issues persist, causing delays and increased costs for manufacturers.",
    date: "2024-03-14",
    source: "Industry Today"
  },
  {
    title: "New Innovations Drive Market Growth",
    content: "Companies embracing AI and automation are seeing positive market responses and increased efficiency.",
    date: "2024-03-13",
    source: "Tech Daily"
  }
];

export function MarketSentiment() {
  const sentiment = new Sentiment();
  
  const analyzeSentiment = (text: string) => {
    const result = sentiment.analyze(text);
    return result.score;
  };

  const getOverallSentiment = () => {
    const scores = mockNews.map(item => analyzeSentiment(item.title + " " + item.content));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return average;
  };

  const overallSentiment = getOverallSentiment();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold">Market Sentiment Analysis</h2>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Market Sentiment</span>
          <div className={`flex items-center ${
            overallSentiment > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {overallSentiment > 0 ? (
              <TrendingUp className="h-5 w-5 mr-1" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-1" />
            )}
            <span className="font-medium">
              {overallSentiment > 0 ? 'Positive' : 'Negative'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockNews.map((item, index) => {
          const sentimentScore = analyzeSentiment(item.title + " " + item.content);
          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sentimentScore > 0 ? 'bg-green-100 text-green-800' :
                  sentimentScore < 0 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sentimentScore > 0 ? 'Positive' :
                   sentimentScore < 0 ? 'Negative' : 'Neutral'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.content}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{item.source}</span>
                <span>{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}