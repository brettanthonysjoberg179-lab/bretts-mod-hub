import { Devvit } from '@devvit/public-api';
import { reddit, redis, scheduler, settings, context } from '@devvit/web/server';
import type {
  TriggerResponse,
  OnAppInstallRequest,
  OnAppUninstallRequest,
  OnUpdateRequest,
  OnCommentCreateRequest,
  OnCommentReportRequest,
  OnPostCreateRequest,
  OnPostReportRequest,
  OnModActionRequest,
  OnModMailRequest,
  OnWikiPageEditRequest,
} from '@devvit/web/shared';

Devvit.configure({
  reddit,
  redis,
});

// ========== APP LIFECYCLE ==========

Devvit.addTrigger({
  event: 'onAppInstall',
  job: async (req: OnAppInstallRequest): Promise<TriggerResponse> => {
    const { subredditId, subredditName } = context;
    console.log(`Brett's Mod Hub installed on r/${subredditName}`);

    // Initialize subreddit settings in Redis
    await redis.hset(`modhub:${subredditId}:config`, {
      installedAt: new Date().toISOString(),
      subredditName: subredditName || '',
      autoModEnabled: 'true',
      queueThreshold: '50',
    });

    // Log the installation
    await redis.lpush(
      `modhub:${subredditId}:log`,
      JSON.stringify({
        action: 'app_install',
        timestamp: new Date().toISOISOString(),
        subreddit: subredditName,
      })
    );

    // Send welcome message to mods
    if (subredditName) {
      await reddit.sendModMail({
        subredditName,
        subject: "Brett's Mod Hub Installed",
        text: "Brett's Mod Hub is now active! Your moderation suite is ready.",
      });
    }

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onAppUninstall',
  job: async (req: OnAppUninstallRequest): Promise<TriggerResponse> => {
    const { subredditId, subredditName } = context;
    console.log(`Brett's Mod Hub uninstalled from r/${subredditName}`);

    // Cleanup Redis keys (optional - keep for 30 days for potential reinstall)
    await redis.expire(`modhub:${subredditId}:config`, 30 * 24 * 60 * 60);
    await redis.expire(`modhub:${subredditId}:log`, 30 * 24 * 60 * 60);

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onUpdate',
  job: async (req: OnUpdateRequest): Promise<TriggerResponse> => {
    const { subredditId, subredditName } = context;
    console.log(`Brett's Mod Hub update trigger on r/${subredditName}`);

    // Update queue count in Redis for dashboard stats
    const queueCount = await redis.get(`modhub:${subredditId}:queue_count`) || '0';
    await redis.set(`modhub:${subredditId}:queue_count`, queueCount, {
      expiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
    });

    return { status: 'ok' };
  },
});

// ========== CONTENT TRIGGERS ==========

Devvit.addTrigger({
  event: 'onCommentCreate',
  job: async (req: OnCommentCreateRequest): Promise<TriggerResponse> => {
    const { subredditId } = context;
    const comment = req.comment;

    // Add to queue processing log
    await redis.lpush(
      `modhub:${subredditId}:comment_log`,
      JSON.stringify({
        type: 'comment_create',
        commentId: comment?.id,
        postId: comment?.postId,
        authorId: comment?.authorId,
        timestamp: new Date().toISOString(),
      })
    );

    // Auto-flair check (if enabled)
    const autoMod = await redis.hget(`modhub:${subredditId}:config`, 'autoModEnabled');
    if (autoMod === 'true' && comment?.body) {
      // Simple spam detection
      const spamKeywords = ['spam', 'buy now', 'click here', 'free money'];
      const body = comment.body.toLowerCase();
      const isSpam = spamKeywords.some(keyword => body.includes(keyword));

      if (isSpam) {
        await redis.lpush(
          `modhub:${subredditId}:spam_queue`,
          JSON.stringify({
            type: 'comment',
            id: comment.id,
            body: comment.body,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onCommentReport',
  job: async (req: OnCommentReportRequest): Promise<TriggerResponse> => {
    const { subredditId, subredditName } = context;

    await redis.lpush(
      `modhub:${subredditId}:report_queue`,
      JSON.stringify({
        type: 'comment',
        commentId: req.comment?.id,
        reports: req.comment?.reports,
        timestamp: new Date().toISOString(),
      })
    );

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onPostCreate',
  job: async (req: OnPostCreateRequest): Promise<TriggerResponse> => {
    const { subredditId } = context;
    const post = req.post;

    await redis.lpush(
      `modhub:${subredditId}:post_log`,
      JSON.stringify({
        type: 'post_create',
        postId: post?.id,
        authorId: post?.authorId,
        title: post?.title,
        timestamp: new Date().toISOString(),
      })
    );

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onPostReport',
  job: async (req: OnPostReportRequest): Promise<TriggerResponse> => {
    const { subredditId } = context;

    await redis.lpush(
      `modhub:${subredditId}:report_queue`,
      JSON.stringify({
        type: 'post',
        postId: req.post?.id,
        reports: req.post?.reports,
        timestamp: new Date().toISOString(),
      })
    );

    return { status: 'ok' };
  },
});

// ========== MODERATION TRIGGERS ==========

Devvit.addTrigger({
  event: 'onModAction',
  job: async (req: OnModActionRequest): Promise<TriggerResponse> => {
    const { subredditId } = context;
    const action = req.modAction;

    // Log the mod action
    await redis.lpush(
      `modhub:${subredditId}:mod_log`,
      JSON.stringify({
        action: action?.action,
        targetId: action?.targetId,
        targetAuthor: action?.targetAuthor,
        modName: action?.modName,
        timestamp: new Date().toISOString(),
      })
    );

    // Update user history
    if (action?.targetAuthor) {
      await redis.hincrby(
        `modhub:${subredditId}:user:${action.targetAuthor}:actions`,
        action.action || 'unknown',
        1
      );
    }

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onModMail',
  job: async (req: OnModMailRequest): Promise<TriggerResponse> => {
    const { subredditId } = context;
    const message = req.message;

    await redis.lpush(
      `modhub:${subredditId}:modmail_queue`,
      JSON.stringify({
        messageId: message?.id,
        author: message?.author?.name,
        subject: message?.subject,
        timestamp: new Date().toISOString(),
      })
    );

    return { status: 'ok' };
  },
});

Devvit.addTrigger({
  event: 'onWikiPageEdit',
  job: async (req: OnWikiPageEditRequest): Promise<TriggerResponse> => {
    const { subredditId } = context;

    await redis.lpush(
      `modhub:${subredditId}:wiki_log`,
      JSON.stringify({
        page: req.wikiPage?.name,
        revision: req.wikiPage?.revision,
        timestamp: new Date().toISOString(),
      })
    );

    return { status: 'ok' };
  },
});

// ========== SCHEDULED TASKS ==========

// Daily stats aggregation
scheduler.runJob({
  name: 'modhub-daily-stats',
  data: {},
  runAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Run daily
});

// ========== UI ELEMENT ==========

Devvit.addUIElement({
  type: 'post',
  location: 'head',
  render: async () => {
    return null;
  },
});

export default Devvit;
