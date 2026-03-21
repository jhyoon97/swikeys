import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function main() {
  const switchesDb = await notion.databases.retrieve({
    database_id: process.env.NOTION_SWITCHES_DB_ID!,
  });
  console.log('=== 스위치 DB 프로퍼티 ===');
  for (const [name, prop] of Object.entries(switchesDb.properties)) {
    console.log(`  ${name}: ${prop.type}`);
  }

  console.log('');

  const commentsDb = await notion.databases.retrieve({
    database_id: process.env.NOTION_COMMENTS_DB_ID!,
  });
  console.log('=== 댓글 DB 프로퍼티 ===');
  for (const [name, prop] of Object.entries(commentsDb.properties)) {
    console.log(`  ${name}: ${prop.type}`);
  }
}

main().catch(console.error);
