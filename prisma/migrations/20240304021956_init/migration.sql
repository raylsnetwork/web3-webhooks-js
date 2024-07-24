-- CreateTable
CREATE TABLE "Subscribe" (
    "id" SERIAL NOT NULL,
    "hostDest" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "event" TEXT,

    CONSTRAINT "Subscribe_pkey" PRIMARY KEY ("id")
);
