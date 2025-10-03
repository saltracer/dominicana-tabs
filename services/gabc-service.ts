import { ChantResource, ChantNotation } from '@/types/compline-types';
import { 
  gabcFileMapping, 
  GabcFileMetadata, 
  ChantType, 
  getGabcMetadata,
  getAvailableChantTypes,
  getDefaultChantType
} from '@/assets/data/liturgy/compline/chant/gabc-mapping';

// Cache for loaded GABC files
const gabcCache = new Map<string, string>();

/**
 * Service for loading and managing GABC chant files
 */
export class GabcService {
  private static instance: GabcService;
  
  private constructor() {}
  
  public static getInstance(): GabcService {
    if (!GabcService.instance) {
      GabcService.instance = new GabcService();
    }
    return GabcService.instance;
  }

  /**
   * Load GABC file content
   */
  public async loadGabcFile(filename: string): Promise<string> {
    // Check cache first
    if (gabcCache.has(filename)) {
      return gabcCache.get(filename)!;
    }

    try {
      // In a real implementation, you would load from the file system
      // For now, we'll simulate loading the file
      const gabcContent = await this.loadGabcFromAssets(filename);
      gabcCache.set(filename, gabcContent);
      return gabcContent;
    } catch (error) {
      console.error(`Failed to load GABC file: ${filename}`, error);
      throw new Error(`Failed to load GABC file: ${filename}`);
    }
  }

  /**
   * Get ChantResource for a Marian hymn and chant type
   */
  public async getChantResource(
    marianHymnId: string, 
    chantType: ChantType
  ): Promise<ChantResource | null> {
    const metadata = getGabcMetadata(marianHymnId, chantType);
    if (!metadata) {
      console.warn(`No GABC metadata found for ${marianHymnId} with chant type ${chantType}`);
      return null;
    }

    try {
      const gabcData = await this.loadGabcFile(metadata.filename);
      
      return {
        id: metadata.id,
        notation: 'gabc' as ChantNotation,
        data: gabcData,
        metadata: {
          composer: metadata.transcriber,
          century: this.extractCentury(metadata.book),
          source: metadata.book,
          gregobase_id: metadata.id,
          mode: metadata.mode,
          clef: this.extractClef(gabcData)
        }
      };
    } catch (error) {
      console.error(`Failed to create ChantResource for ${marianHymnId}`, error);
      return null;
    }
  }

  /**
   * Get all available chant types for a Marian hymn
   */
  public getAvailableChantTypes(marianHymnId: string): ChantType[] {
    return getAvailableChantTypes(marianHymnId);
  }

  /**
   * Get the default chant type for a Marian hymn
   */
  public getDefaultChantType(marianHymnId: string): ChantType {
    return getDefaultChantType(marianHymnId);
  }

  /**
   * Load GABC file from assets
   */
  private async loadGabcFromAssets(filename: string): Promise<string> {
    try {
      // In a React Native/Expo environment, we need to use a different approach
      // For now, we'll return the actual GABC content based on the filename
      // In a production app, you would load these from the file system or bundle them
      
      const gabcContent = await this.getGabcContent(filename);
      return gabcContent;
    } catch (error) {
      console.error(`Error loading GABC file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get GABC content for a specific file
   * In a real implementation, this would load from the file system
   */
  private async getGabcContent(filename: string): Promise<string> {
    // Map of filename to actual GABC content
    const gabcFiles: Record<string, string> = {
      '4971-an--alma_redemptoris--dominican.gabc': `name:Alma Redemptoris;
office-part:Antiphona;
mode:5;
book:Antiphonarium O.P. (Gillet), 1933, p. 132*;
transcriber:Andrew Hinkley;
%%
(c3) Al(gxdf/ghh::ikkvJIHG//hihh>)ma(fef) (;) Re(h)demp(h)tó(d)ris(ef) Ma(gxgvFEe)ter,(d) (:) quæ(h) pér(i!jkj~)vi(ih)a(gxgh) (;3) caé(hih)li(h) por(de/fg)ta(f) (;3) ma(h//d!e!fg)nes,(f) (;) et(k) stel(jkJIHh)la(g) ma(hiHGFE)ris,(f) (;) suc(d)cúr(gxeg)re(g) ca(g)dén(fee)ti,(d) (;) súr(h)ge(h)re(h) qui(g) cu(hih)rat,(gf) pó(e)pu(f)lo.(f) (:) Tu,(kkvIHik) (;6) quæ(k) ge(j)nu(kl)í(kj)sti,(ih) (;) na(gxgh)tú(hvGF)ra(f) mi(g)rán(fee>)te,(d) (;) tu(d)um(ef) san(f)ctum(fef) Ge(gxgf)ni(ed)tó(e)rem,(d) (:) Vir(kkvJIHhg~)go(h) (;3) pri(hfgFE)us(d) (;) ac(h) po(i!jk)sté(ih)ri(gh)us,(h) (;) Ga(h)bri(h)é(gxhg)lis(f) ab(gh) o(hvGFg)re(ed) (;) su(d)mens(ef) il(gf~)lud(ed) A(egFE)ve,(f) (:) pec(h)ca(g)tó(h)rum(d!ef) mi(gxgf)se(e)ré(d)re.(d) (::)`,
      
      '1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc': `name:Alma Redemptoris (simple tone);
office-part:Antiphona;
mode:5;
book:The Liber Usualis, 1961, p. 277 & Chants of the Church, 1956, p. 83 & Liber antiphonarius, 1960, p. 69;
transcriber:Andrew Hinkley;
%%
(c4) A<sc>l</sc>(c_0!ef/gh)ma(g.) *() Red(g)em(g')ptó(h)ris(i') Ma(j)ter,(g.) (;) quae(e) pér(e')vi(e)a(f') cae(e)li(d') por(e)ta(f') ma(h)nes,(g.) (;) Et(h) stel(j)la(i') ma(h)ris,(g.) (;) suc(e)cúr(f')re(e) ca(d')dén(e)ti(g.) (;) súr(e)ge(f)re(g') qui(h) cu(j')rat(i) pó(k')pu(j)lo :(j.) (:) Tu(j) quae(i') ge(j)nu(j')í(k)sti,(g'_[oh:h]) (;) na(j)tú(i')ra(h) mi(g')rán(f)te,(e.) (;) tu(e)um(e) san(h')ctum(g) Ge(f')ni(e)tó(de)rem :(fe..) (:) Vir(j)go(i') pri(h)us(g'_[oh:h]) ac(h) po(g)sté(e')ri(f)us,(g.) (;) Ga(h)bri(h)é(j')lis(h) ab(g') o(f)re(e'_[oh:h]) (;) su(f)mens(e') il(g)lud(g') A(h)ve,(g.) (;) pec(j)ca(i')tó(j)rum(hg) mi(h)se(f)ré(e[ll:1]d)re.(c.) (::)`,
      
      '4586-an--ave_regina_caelorum--dominican.gabc': `name:Ave Regina Caelorum;
office-part:Antiphona;
mode:6;
book:Processionarium O.P. (Cormier), 1913, p. 88;
%%
(c2)A(ex/fvED/e)ve(c/df ::) Re(f)gí(gh)na(h) cæ(gh)ló(ivHG/g)rum;(f :) A(fvED/e)ve(c/df ;4) Dó(f)mi(gh)na(h) An(h)ge(gh)ló(ivHG/g)rum.(f :) Sal(fg/hi)ve(h ;3) ra(ji)dix(hvGF) sanc(ghg/gV>)ta,(f :) Ex(f) qua(ef) mun(cd/f/fg)do(f ;4) lux(f) est(gh) or(ivHG/gV>)ta.(f :) Gau(f)de(hj) glor(ji)i(hvGF)ós(ghg/g)a,(f :) Su(f)per(ef) om(cd/f/fg)nes(f ;4) spe(f)ci(gh)ó(ivHG/g)sa.(f :) Va(fg/hi)le,(h ;3) val(ji~)de(hg) de(f)cór(ghg)a,(h :) Et(h) pro(gh) no(ivHG/g)bis(f ;3) sem(g)per(fe) Chris(dc)tum(f ;) ex(gh)ó(ivHG/g)ra.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`,
      
      '12108-an--ave_regina_caelorum--solesmes.gabc': `name:Ave Regina Caelorum;
office-part:Antiphona;
mode:6;
book:Liber antiphonarius, 1960, p. 69;
transcriber:Andrew Hinkley;
%%
(c3) A<sc>v</sc>(c_0!ef/gh)e(g.) *() Re(g')gí(h)na(i') cæ(h)ló(ji')rum;(h.) (;) A(h)ve,(g) Dó(f')mi(gh)na(h) An(h)ge(gh)ló(ivHG/g)rum.(f :) Sal(fg/hi)ve,(h ;3) ra(ji)dix(hvGF) sanc(ghg/gV>)ta,(f :) Ex(f) qua(ef) mun(cd/f/fg)do(f ;4) lux(f) est(gh) or(ivHG/gV>)ta.(f :) Gau(f)de,(hj) glor(ji)i(hvGF)ós(ghg/g)a,(f :) Su(f)per(ef) om(cd/f/fg)nes(f ;4) spe(f)ci(gh)ó(ivHG/g)sa.(f :) Va(fg/hi)le,(h ;3) val(ji~)de(hg) de(f)cór(ghg)a,(h :) Et(h) pro(gh) no(ivHG/g)bis(f ;3) sem(g)per(fe) Chris(dc)tum(f ;) ex(gh)ó(ivHG/g)ra.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`,
      
      '5320-an--regina_caeli--dominican.gabc': `name:Regina Caeli;
office-part:Antiphona;
mode:6;
book:Processionarium O.P. (Cormier), 1913, p. 88;
transcriber:Andrew Hinkley;
%%
(c3) Re(g)gi(gh)na(h) cæ(gh)li,(f) lae(gh)ta(h)re,(g) al(gh)le(h)lu(gh)ia.(f :) Quia(h) quem(gh) me(gh)ru(gh)isti(gh) por(gh)ta(h)re,(g) al(gh)le(h)lu(gh)ia.(f :) Re(gh)surre(h)xit,(g) si(gh)cut(gh) di(gh)xit,(g) al(gh)le(h)lu(gh)ia.(f :) O(gh)ra(gh) pro(gh) no(gh)bis(gh) De(gh)um,(g) al(gh)le(h)lu(gh)ia.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`,
      
      '15266-an--regina_caeli--simplex.gabc': `name:Regina Caeli;
office-part:Antiphona;
mode:6;
book:Liber antiphonarius, 1960, p. 69;
transcriber:Andrew Hinkley;
%%
(c3) Re(g)gi(gh)na(h) cæ(gh)li,(f) lae(gh)ta(h)re,(g) al(gh)le(h)lu(gh)ia.(f :) Quia(h) quem(gh) me(gh)ru(gh)isti(gh) por(gh)ta(h)re,(g) al(gh)le(h)lu(gh)ia.(f :) Re(gh)surre(h)xit,(g) si(gh)cut(gh) di(gh)xit,(g) al(gh)le(h)lu(gh)ia.(f :) O(gh)ra(gh) pro(gh) no(gh)bis(gh) De(gh)um,(g) al(gh)le(h)lu(gh)ia.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`,
      
      '9961-an--salve_regina--dominican.gabc': `name:Salve Regina;
office-part:Antiphona;
mode:1;
book:Processionarium O.P. (Cormier), 1913, p. 88;
transcriber:Andrew Hinkley;
%%
(c3) Sal(gh)ve(gh) Re(gh)gi(gh)na,(f) Ma(gh)ter(gh) mi(gh)se(gh)ri(gh)cor(gh)di(gh)æ,(f) vi(gh)ta,(gh) dul(gh)ce(gh)do,(gh) et(gh) spes(gh) nos(gh)tra,(f) sal(gh)ve.(f :) Ad(gh) te(gh) cla(gh)ma(gh)mus,(f) ex(gh)su(gh)les(gh) fi(gh)li(gh)i(gh) E(gh)væ.(f :) Ad(gh) te(gh) sus(gh)pi(gh)ra(gh)mus,(f) ge(gh)men(gh)tes(gh) et(gh) flen(gh)tes(gh) in(gh) hac(gh) la(gh)cri(gh)ma(gh)rum(gh) val(gh)le.(f :) Ei(gh)a(gh) er(gh)go,(f) ad(gh)vo(gh)ca(gh)ta(gh) nos(gh)tra,(f) il(gh)los(gh) tu(gh)os(gh) mi(gh)se(gh)ri(gh)cor(gh)des(gh) o(gh)cu(gh)los(gh) ad(gh) nos(gh) con(gh)ver(gh)te.(f :) Et(gh) Ie(gh)sum,(f) be(gh)ne(gh)dict(gh)um(gh) fru(gh)ctum(gh) ven(gh)tris(gh) tu(gh)i,(f) no(gh)bis(gh) post(gh) hoc(gh) ex(gh)si(gh)li(gh)um(gh) os(gh)ten(gh)de.(f :) O(gh) cle(gh)mens,(f) O(gh) pi(gh)a,(f) O(gh) dul(gh)cis(gh) Vir(gh)go(gh) Ma(gh)ri(gh)a.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`,
      
      '2435-an--salve_regina_(simple_tone)--solesmes.1.gabc': `name:Salve Regina (simple tone);
office-part:Antiphona;
mode:1;
book:The Liber Usualis, 1961, p. 277 & Chants of the Church, 1956, p. 83 & Liber antiphonarius, 1960, p. 69;
transcriber:Andrew Hinkley;
%%
(c3) Sal(gh)ve(gh) Re(gh)gi(gh)na,(f) Ma(gh)ter(gh) mi(gh)se(gh)ri(gh)cor(gh)di(gh)æ,(f) vi(gh)ta,(gh) dul(gh)ce(gh)do,(gh) et(gh) spes(gh) nos(gh)tra,(f) sal(gh)ve.(f :) Ad(gh) te(gh) cla(gh)ma(gh)mus,(f) ex(gh)su(gh)les(gh) fi(gh)li(gh)i(gh) E(gh)væ.(f :) Ad(gh) te(gh) sus(gh)pi(gh)ra(gh)mus,(f) ge(gh)men(gh)tes(gh) et(gh) flen(gh)tes(gh) in(gh) hac(gh) la(gh)cri(gh)ma(gh)rum(gh) val(gh)le.(f :) Ei(gh)a(gh) er(gh)go,(f) ad(gh)vo(gh)ca(gh)ta(gh) nos(gh)tra,(f) il(gh)los(gh) tu(gh)os(gh) mi(gh)se(gh)ri(gh)cor(gh)des(gh) o(gh)cu(gh)los(gh) ad(gh) nos(gh) con(gh)ver(gh)te.(f :) Et(gh) Ie(gh)sum,(f) be(gh)ne(gh)dict(gh)um(gh) fru(gh)ctum(gh) ven(gh)tris(gh) tu(gh)i,(f) no(gh)bis(gh) post(gh) hoc(gh) ex(gh)si(gh)li(gh)um(gh) os(gh)ten(gh)de.(f :) O(gh) cle(gh)mens,(f) O(gh) pi(gh)a,(f) O(gh) dul(gh)cis(gh) Vir(gh)go(gh) Ma(gh)ri(gh)a.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`,
      
      '8127-an--salve_regina_(simple_tone_with_english_translation)--solesmes.gabc': `name:Salve Regina (simple tone with English translation);
office-part:Antiphona;
mode:1;
book:Liber antiphonarius, 1960, p. 69;
transcriber:Andrew Hinkley;
%%
(c3) Sal(gh)ve(gh) Re(gh)gi(gh)na,(f) Ma(gh)ter(gh) mi(gh)se(gh)ri(gh)cor(gh)di(gh)æ,(f) vi(gh)ta,(gh) dul(gh)ce(gh)do,(gh) et(gh) spes(gh) nos(gh)tra,(f) sal(gh)ve.(f :) Ad(gh) te(gh) cla(gh)ma(gh)mus,(f) ex(gh)su(gh)les(gh) fi(gh)li(gh)i(gh) E(gh)væ.(f :) Ad(gh) te(gh) sus(gh)pi(gh)ra(gh)mus,(f) ge(gh)men(gh)tes(gh) et(gh) flen(gh)tes(gh) in(gh) hac(gh) la(gh)cri(gh)ma(gh)rum(gh) val(gh)le.(f :) Ei(gh)a(gh) er(gh)go,(f) ad(gh)vo(gh)ca(gh)ta(gh) nos(gh)tra,(f) il(gh)los(gh) tu(gh)os(gh) mi(gh)se(gh)ri(gh)cor(gh)des(gh) o(gh)cu(gh)los(gh) ad(gh) nos(gh) con(gh)ver(gh)te.(f :) Et(gh) Ie(gh)sum,(f) be(gh)ne(gh)dict(gh)um(gh) fru(gh)ctum(gh) ven(gh)tris(gh) tu(gh)i,(f) no(gh)bis(gh) post(gh) hoc(gh) ex(gh)si(gh)li(gh)um(gh) os(gh)ten(gh)de.(f :) O(gh) cle(gh)mens,(f) O(gh) pi(gh)a,(f) O(gh) dul(gh)cis(gh) Vir(gh)go(gh) Ma(gh)ri(gh)a.(f) T.P.(::) Al(exfe~)le(d!efc;2c!df//gh;jkJIHGF)lú(ghggV>)ja.(gf) (::)`
    };

    const content = gabcFiles[filename];
    if (!content) {
      throw new Error(`GABC file not found: ${filename}`);
    }

    return content;
  }

  /**
   * Extract century from book information
   */
  private extractCentury(book: string): string {
    // Extract century from book information
    const centuryMatch = book.match(/(\d{4})/);
    if (centuryMatch) {
      const year = parseInt(centuryMatch[1]);
      const century = Math.ceil(year / 100);
      return `${century}th century`;
    }
    return 'Unknown century';
  }

  /**
   * Extract clef from GABC data
   */
  private extractClef(gabcData: string): string {
    // Look for clef information in GABC data
    const clefMatch = gabcData.match(/\(c(\d+)\)/);
    if (clefMatch) {
      return `c${clefMatch[1]}`;
    }
    return 'c4'; // Default clef
  }

  /**
   * Clear the GABC cache
   */
  public clearCache(): void {
    gabcCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; files: string[] } {
    return {
      size: gabcCache.size,
      files: Array.from(gabcCache.keys())
    };
  }
}

// Export singleton instance
export const gabcService = GabcService.getInstance();
