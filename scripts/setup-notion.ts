/**
 * Notion 데이터베이스 프로퍼티 자동 설정 스크립트
 *
 * 사용법: npx tsx scripts/setup-notion.ts
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const SWITCHES_DB_ID = process.env.NOTION_SWITCHES_DB_ID!;
const COMMENTS_DB_ID = process.env.NOTION_COMMENTS_DB_ID!;

async function setupCommentsDB() {
  console.log('💬 댓글 DB 프로퍼티 설정 중...');

  // Step 1: 기존 "이름" title을 "내용"으로 rename
  await notion.databases.update({
    database_id: COMMENTS_DB_ID,
    properties: {
      '이름': { name: '내용' },
    },
  } as any);
  console.log('  ✅ "이름" → "내용" rename 완료');

  // Step 2: 나머지 프로퍼티 추가
  await notion.databases.update({
    database_id: COMMENTS_DB_ID,
    title: [{ text: { content: '댓글 DB' } }],
    properties: {
      '작성자': { rich_text: {} },
      '스위치': {
        relation: {
          database_id: SWITCHES_DB_ID,
          single_property: {},
        },
      },
      '타입': {
        select: {
          options: [
            { name: '한줄평', color: 'blue' },
            { name: '빌드공유', color: 'green' },
          ],
        },
      },
      '타건음URL': { url: {} },
      '작성일': { date: {} },
    },
  });

  console.log('✅ 댓글 DB 프로퍼티 설정 완료');
}

async function addSampleSwitches() {
  console.log('🔧 샘플 스위치 데이터 추가 중...');

  const samples = [
    {
      name: 'Cherry MX Red',
      manufacturer: 'Cherry',
      type: '리니어',
      upperHousing: 'PC',
      lowerHousing: 'Nylon',
      stem: 'POM',
      factoryLubed: false,
      springLength: 15,
      mountPins: '5',
      travel: 4.0,
      actuationPoint: 2.0,
      actuation: 45,
      initial: 30,
      bottom: 60,
    },
    {
      name: 'Gateron Yellow',
      manufacturer: 'Gateron',
      type: '리니어',
      upperHousing: 'PC',
      lowerHousing: 'Nylon',
      stem: 'POM',
      factoryLubed: true,
      springLength: 15,
      mountPins: '5',
      travel: 4.0,
      actuationPoint: 2.0,
      actuation: 50,
      initial: 35,
      bottom: 67,
    },
    {
      name: 'Bsun Holy Panda',
      manufacturer: 'Bsun',
      type: '택타일',
      upperHousing: 'PC',
      lowerHousing: 'Nylon',
      stem: 'POM',
      factoryLubed: false,
      springLength: 15,
      mountPins: '5',
      travel: 4.0,
      actuationPoint: 1.9,
      actuation: 67,
      initial: 52,
      bottom: 72,
    },
  ];

  for (const sw of samples) {
    await notion.pages.create({
      parent: { database_id: SWITCHES_DB_ID },
      properties: {
        '이름': { title: [{ text: { content: sw.name } }] },
        '제조사': { rich_text: [{ text: { content: sw.manufacturer } }] },
        '스위치타입': { select: { name: sw.type } },
        '상부하우징재질': { rich_text: [{ text: { content: sw.upperHousing } }] },
        '하부하우징재질': { rich_text: [{ text: { content: sw.lowerHousing } }] },
        '스템재질': { rich_text: [{ text: { content: sw.stem } }] },
        '공장윤활': { checkbox: sw.factoryLubed },
        '스프링길이': { number: sw.springLength },
        '마운트핀': { select: { name: sw.mountPins } },
        '트래블': { number: sw.travel },
        '입력지점': { number: sw.actuationPoint },
        '입력압': { number: sw.actuation },
        '초기압': { number: sw.initial },
        '바닥압': { number: sw.bottom },
      } as any,
    });
    console.log(`  ✅ ${sw.name} 추가됨`);
  }

  console.log('✅ 샘플 데이터 추가 완료');
}

async function main() {
  console.log('🚀 Notion 데이터베이스 설정을 시작합니다...\n');
  console.log('ℹ️  스위치 DB는 프로퍼티가 이미 설정되어 있으므로 건너뜁니다.\n');

  try {
    // 댓글 DB 프로퍼티는 이미 설정됨 - 건너뜀
    console.log('ℹ️  댓글 DB도 이미 설정되어 있으므로 건너뜁니다.\n');
    await addSampleSwitches();

    console.log('\n🎉 모든 설정이 완료되었습니다!');
    console.log('');
    console.log('📌 수동으로 해야 할 작업:');
    console.log('   1. Notion에서 스위치 DB를 엽니다');
    console.log('   2. 프로퍼티 추가 → 이름: "상태" → 타입: Status');
    console.log('   3. Status 옵션 추가: 게시됨 / 제보(대기중) / 검토중');
    console.log('   4. 샘플 데이터 3개의 상태를 "게시됨"으로 변경');
    console.log('');
    console.log('   그러면 사이트에서 스위치가 표시됩니다!');
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message || error);
    if (error.code === 'object_not_found') {
      console.error('\n   → DB가 Integration과 공유되어 있는지 확인하세요.');
    }
  }
}

main();
