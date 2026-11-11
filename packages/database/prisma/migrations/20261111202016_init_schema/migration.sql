-- CreateEnum
CREATE TYPE "RankCode" AS ENUM ('E', 'D', 'C', 'B', 'A', 'S', 'MONARCH');

-- CreateEnum
CREATE TYPE "BaseStatCode" AS ENUM ('ACAD', 'AI_ENG', 'CYBER', 'EXP', 'LNG', 'FIN', 'STR', 'DIS');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('DAILY', 'EMERGENCY', 'BOSS', 'JOB_CHANGE', 'PENALTY');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('AUDIO_SUMMARY', 'GITHUB_URL', 'SCREENSHOT', 'TEXT_LOG', 'NONE');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('NEW', 'TRACKED', 'APPLIED', 'WON', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShopCategory" AS ENUM ('LEISURE', 'GAMING', 'TECH', 'REST');

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "total_xp" BIGINT NOT NULL DEFAULT 0,
    "rank_code" "RankCode" NOT NULL DEFAULT 'E',
    "current_hp" INTEGER NOT NULL DEFAULT 100,
    "max_hp" INTEGER NOT NULL DEFAULT 100,
    "current_mp" INTEGER NOT NULL DEFAULT 100,
    "max_mp" INTEGER NOT NULL DEFAULT 100,
    "shadow_crystals" INTEGER NOT NULL DEFAULT 0,
    "current_title" VARCHAR(100) NOT NULL DEFAULT 'L''Éveillé Novice',
    "theme_preference" VARCHAR(30) NOT NULL DEFAULT 'DARK_MONARCH',
    "discord_user_id" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "base_code" "BaseStatCode" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "current_xp" INTEGER NOT NULL DEFAULT 0,
    "next_level_xp" INTEGER NOT NULL DEFAULT 100,
    "total_points_invested" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_nodes" (
    "id" UUID NOT NULL,
    "stat_id" UUID NOT NULL,
    "base_code" "BaseStatCode" NOT NULL,
    "parent_node_id" UUID,
    "node_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "required_stat_level" INTEGER NOT NULL DEFAULT 1,
    "is_unlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlocked_at" TIMESTAMP(3),

    CONSTRAINT "skill_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "quest_code" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "quest_type" "QuestType" NOT NULL,
    "target_stat" "BaseStatCode" NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "QuestStatus" NOT NULL DEFAULT 'PENDING',
    "proof_type" "ProofType" NOT NULL DEFAULT 'NONE',
    "proof_data" TEXT,
    "architect_score" INTEGER,
    "architect_feedback" TEXT,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_blocks" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "block_date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "target_stat" "BaseStatCode" NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "alarm_triggered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "second_brain_notes" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "markdown_content" TEXT NOT NULL,
    "related_stat" "BaseStatCode",
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "second_brain_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_transcriptions" (
    "id" UUID NOT NULL,
    "note_id" UUID,
    "quest_id" UUID,
    "duration_seconds" INTEGER NOT NULL,
    "audio_format" VARCHAR(50) NOT NULL DEFAULT 'audio/webm',
    "raw_transcript" TEXT NOT NULL,
    "ai_summary" TEXT NOT NULL,
    "ai_quality_score" INTEGER NOT NULL,
    "transcribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_routines" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "targetGroup" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_steps" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "exercise_name" VARCHAR(100) NOT NULL,
    "exercise_type" VARCHAR(20) NOT NULL,
    "target_reps" INTEGER,
    "duration_seconds" INTEGER,
    "target_angle_min" DOUBLE PRECISION,
    "target_angle_max" DOUBLE PRECISION,
    "key_joint_points" INTEGER[],

    CONSTRAINT "workout_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_execution_logs" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "total_reps_logged" INTEGER NOT NULL DEFAULT 0,
    "cv_accuracy_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completed_strict" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workout_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "real_world_achievements" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "hackathons_won_count" INTEGER NOT NULL DEFAULT 0,
    "cambridge_english_level" VARCHAR(10) NOT NULL DEFAULT 'NONE',
    "class_rank_percentile" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "calisthenics_mastered" BOOLEAN NOT NULL DEFAULT false,
    "production_saas_active_users" INTEGER NOT NULL DEFAULT 0,
    "net_worth_or_sponsorship_eur" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "real_world_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_integration_configs" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "service_name" VARCHAR(50) NOT NULL,
    "api_key_encrypted" TEXT,
    "profile_id" VARCHAR(100),
    "external_user_id" VARCHAR(100),
    "sync_status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "last_synced_at" TIMESTAMPTZ(6),

    CONSTRAINT "external_integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "external_url" VARCHAR(1000) NOT NULL,
    "estimated_value_eur" INTEGER,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'NEW',
    "discovered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_purchases" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "item_name" VARCHAR(150) NOT NULL,
    "crystal_cost" INTEGER NOT NULL,
    "category" "ShopCategory" NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "event_payload" JSONB NOT NULL,
    "ip_address" VARCHAR(50),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_username_key" ON "players"("username");

-- CreateIndex
CREATE UNIQUE INDEX "players_discord_user_id_key" ON "players"("discord_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_player_id_base_code_key" ON "player_stats"("player_id", "base_code");

-- CreateIndex
CREATE UNIQUE INDEX "skill_nodes_node_code_key" ON "skill_nodes"("node_code");

-- CreateIndex
CREATE UNIQUE INDEX "quests_quest_code_key" ON "quests"("quest_code");

-- CreateIndex
CREATE INDEX "quests_player_id_status_expires_at_idx" ON "quests"("player_id", "status", "expires_at");

-- CreateIndex
CREATE INDEX "time_blocks_player_id_block_date_idx" ON "time_blocks"("player_id", "block_date");

-- CreateIndex
CREATE UNIQUE INDEX "second_brain_notes_slug_key" ON "second_brain_notes"("slug");

-- CreateIndex
CREATE INDEX "second_brain_notes_player_id_related_stat_idx" ON "second_brain_notes"("player_id", "related_stat");

-- CreateIndex
CREATE UNIQUE INDEX "workout_routines_code_key" ON "workout_routines"("code");

-- CreateIndex
CREATE UNIQUE INDEX "workout_steps_routine_id_step_number_key" ON "workout_steps"("routine_id", "step_number");

-- CreateIndex
CREATE UNIQUE INDEX "real_world_achievements_player_id_key" ON "real_world_achievements"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "external_integration_configs_player_id_service_name_key" ON "external_integration_configs"("player_id", "service_name");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_key" ON "opportunities"("slug");

-- CreateIndex
CREATE INDEX "opportunities_player_id_status_deadline_idx" ON "opportunities"("player_id", "status", "deadline");

-- CreateIndex
CREATE INDEX "shop_purchases_player_id_purchased_at_idx" ON "shop_purchases"("player_id", "purchased_at");

-- CreateIndex
CREATE INDEX "audit_logs_player_id_event_type_timestamp_idx" ON "audit_logs"("player_id", "event_type", "timestamp");

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_nodes" ADD CONSTRAINT "skill_nodes_stat_id_fkey" FOREIGN KEY ("stat_id") REFERENCES "player_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_nodes" ADD CONSTRAINT "skill_nodes_parent_node_id_fkey" FOREIGN KEY ("parent_node_id") REFERENCES "skill_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "second_brain_notes" ADD CONSTRAINT "second_brain_notes_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_transcriptions" ADD CONSTRAINT "voice_transcriptions_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "second_brain_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_transcriptions" ADD CONSTRAINT "voice_transcriptions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_steps" ADD CONSTRAINT "workout_steps_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "workout_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_execution_logs" ADD CONSTRAINT "workout_execution_logs_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "workout_routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_execution_logs" ADD CONSTRAINT "workout_execution_logs_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "real_world_achievements" ADD CONSTRAINT "real_world_achievements_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_integration_configs" ADD CONSTRAINT "external_integration_configs_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_purchases" ADD CONSTRAINT "shop_purchases_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
