import { BibleService } from '../BibleService';
import { USXParser } from '../USXParser';

// Minimal USX sample spanning two chapters with simple verses
const SAMPLE_USX = `<?xml version="1.0" encoding="utf-8"?>
<usx version="3.0">
  <book code="GEN" style="id" />
  <para style="h">Genesis</para>
  <para style="toc1">Genesis</para>
  <para style="toc2">Genesis</para>
  <para style="toc3">Gen</para>
  <chapter number="1" style="c" sid="GEN 1" />
  <para style="p">
    <verse number="1" style="v" sid="GEN 1:1" />In the beginning... <verse eid="GEN 1:1" />
    <verse number="2" style="v" sid="GEN 1:2" />The earth was without form... <verse eid="GEN 1:2" />
  </para>
  <chapter eid="GEN 1" />
  <chapter number="2" style="c" sid="GEN 2" />
  <para style="p">
    <verse number="1" style="v" sid="GEN 2:1" />Thus the heavens and the earth were finished... <verse eid="GEN 2:1" />
    <verse number="7" style="v" sid="GEN 2:7" />Then the Lord God formed man... <verse eid="GEN 2:7" />
  </para>
  <chapter eid="GEN 2" />
</usx>`;

describe('BibleService getPassageByReference', () => {
  it('returns single verse', async () => {
    const svc = new BibleService();
    jest.spyOn<any, any>(svc as any, 'loadUSXFile').mockResolvedValue(SAMPLE_USX);
    const res = await svc.getPassageByReference('Genesis 1:1');
    expect(res).not.toBeNull();
    expect(res!.bookCode).toBe('GEN');
    expect(res!.verses.length).toBe(1);
    expect(res!.verses[0].reference).toBe('GEN 1:1');
  });

  it('returns intra-chapter range', async () => {
    const svc = new BibleService();
    jest.spyOn<any, any>(svc as any, 'loadUSXFile').mockResolvedValue(SAMPLE_USX);
    const res = await svc.getPassageByReference('GEN 1:1-2');
    expect(res).not.toBeNull();
    expect(res!.verses.map(v => v.reference)).toEqual(['GEN 1:1', 'GEN 1:2']);
  });

  it('returns cross-chapter range', async () => {
    const svc = new BibleService();
    jest.spyOn<any, any>(svc as any, 'loadUSXFile').mockResolvedValue(SAMPLE_USX);
    const res = await svc.getPassageByReference('Genesis 1:2-2:7');
    expect(res).not.toBeNull();
    expect(res!.verses[0].reference).toBe('GEN 1:2');
    expect(res!.verses[res!.verses.length - 1].reference).toBe('GEN 2:7');
  });
});

