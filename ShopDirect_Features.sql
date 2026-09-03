USE [ShopDirectDB]
GO

IF OBJECT_ID(N'dbo.Reviews', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Reviews](
        [ReviewId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ProductId] int NOT NULL,
        [UserId] int NOT NULL,
        [Rating] int NOT NULL,
        [Comment] nvarchar(1000) NOT NULL,
        [CreatedAt] datetime NOT NULL CONSTRAINT [DF_Reviews_CreatedAt] DEFAULT (getdate()),
        CONSTRAINT [CK_Reviews_Rating] CHECK ([Rating] >= 1 AND [Rating] <= 5),
        CONSTRAINT [FK_Reviews_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([ProductId]),
        CONSTRAINT [FK_Reviews_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId])
    );
END
GO

IF OBJECT_ID(N'dbo.ReturnRequests', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ReturnRequests](
        [ReturnRequestId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [OrderId] int NOT NULL,
        [UserId] int NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [Status] nvarchar(50) NOT NULL CONSTRAINT [DF_ReturnRequests_Status] DEFAULT (N'Chờ duyệt'),
        [CreatedAt] datetime NOT NULL CONSTRAINT [DF_ReturnRequests_CreatedAt] DEFAULT (getdate()),
        CONSTRAINT [FK_ReturnRequests_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([OrderId]),
        CONSTRAINT [FK_ReturnRequests_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId])
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ReturnRequests_Order_User_Pending' AND object_id = OBJECT_ID(N'dbo.ReturnRequests'))
BEGIN
    CREATE UNIQUE INDEX [UX_ReturnRequests_Order_User_Pending]
    ON [dbo].[ReturnRequests]([OrderId], [UserId])
    WHERE [Status] = N'Chờ duyệt';
END
GO
