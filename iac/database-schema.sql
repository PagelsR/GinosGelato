-- FIFOWorldCup Prediction Hub Database Schema
-- Generated from EF Core Migrations for Azure SQL Database

-- Create Users Table
CREATE TABLE [Users] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Username] NVARCHAR(50) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create unique index on Username
CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

-- Create Matches Table
CREATE TABLE [Matches] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [HomeTeam] NVARCHAR(100) NOT NULL,
    [AwayTeam] NVARCHAR(100) NOT NULL,
    [MatchDateTime] DATETIME2 NOT NULL,
    [HomeTeamScore] INT NULL,
    [AwayTeamScore] INT NULL
);

-- Create Predictions Table
CREATE TABLE [Predictions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [MatchId] INT NOT NULL,
    [PredictionHomeScore] INT NOT NULL,
    [PredictionAwayScore] INT NOT NULL,
    [PredictedWinnerTeamId] INT NULL,
    [PointsAwarded] INT NOT NULL DEFAULT 0,
    CONSTRAINT [FK_Predictions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Predictions_Matches_MatchId] FOREIGN KEY ([MatchId]) REFERENCES [Matches] ([Id]) ON DELETE CASCADE
);

-- Create indexes for Predictions
CREATE INDEX [IX_Predictions_UserId] ON [Predictions] ([UserId]);
CREATE INDEX [IX_Predictions_MatchId] ON [Predictions] ([MatchId]);

-- Seed Users Data
SET IDENTITY_INSERT [Users] ON;

INSERT INTO [Users] ([Id], [Username], [Email], [Name], [CreatedAt])
VALUES
    (1, 'trish', 'trish.roberts@predictionhub.com', 'Trish Roberts', GETUTCDATE()),
    (2, 'zuhaer', 'zuhaer.zim@predictionhub.com', 'Zuhaer Zim', GETUTCDATE()),
    (3, 'bryan', 'bryan.minton@predictionhub.com', 'Bryan Minton', GETUTCDATE()),
    (4, 'randy', 'randy.pagels@predictionhub.com', 'Randy Pagels', GETUTCDATE()),
    (5, 'jdoe', 'jdoe@example.com', 'John Doe', GETUTCDATE()),
    (6, 'jsmith', 'jsmith@example.com', 'Jane Smith', GETUTCDATE()),
    (7, 'bwilliams', 'bwilliams@example.com', 'Bob Williams', GETUTCDATE()),
    (8, 'ajones', 'ajones@example.com', 'Alice Jones', GETUTCDATE());

SET IDENTITY_INSERT [Users] OFF;
GO
