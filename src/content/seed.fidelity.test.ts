import { describe, expect, it } from 'vitest';
import { getContent } from './index';
import { getProject, nextProject as oldNext, projects as oldProjects } from './projects';
import { captionOf, emailHref, getProjectById, nextProject, phoneHref, resolveImage, text, tokens } from './select';
import { nav, processSteps, serviceCategories, site } from './site';
import { validate } from './validate';

const c = await getContent();

describe('seed equals the previous content modules', () => {
  it('has no validation issue', () => {
    expect(validate(c)).toEqual([]);
  });

  it('matches the site data', () => {
    expect(c.site.name).toBe(site.name);
    expect(tokens(c, new Date()).founded).toBe(site.founded);
    expect(c.contact.phone).toBe(site.phone);
    expect(phoneHref(c)).toBe(site.phoneHref);
    expect(c.contact.email).toBe(site.email);
    expect(emailHref(c)).toBe(site.emailHref);
    expect(c.contact.address).toEqual(site.address);
    expect(c.demo.footer).toBe(site.demoNote);
    expect(c.site.demoMode).toBe(true);
  });

  it('matches the navigation', () => {
    expect(c.navigation.map((n) => ({ href: n.href, label: n.label }))).toEqual(nav);
    expect(c.navigation.every((n) => n.visible)).toBe(true);
  });

  it('matches the process steps', () => {
    expect(c.processSteps.map((s) => s.title)).toEqual(processSteps);
  });

  it('matches the service categories', () => {
    expect(c.serviceCategories).toHaveLength(serviceCategories.length);
    c.serviceCategories.forEach((cat, i) => {
      const old = serviceCategories[i];
      expect(String(i + 1).padStart(2, '0')).toBe(old.no);
      expect(cat.slug).toBe(old.slug);
      expect(cat.name).toBe(old.name);
      expect(cat.sentence).toBe(old.sentence);
      expect(cat.services.map((s) => ({ name: s.name, desc: s.desc }))).toEqual(old.services);
      expect(resolveImage(c, cat.image)).toEqual(old.image);
      expect(getProjectById(c, cat.projectId!)?.slug).toBe(old.projectSlug);
    });
  });

  it('matches the counts used in the texts', () => {
    expect(text(c, '{Categories} kategori, {services} hizmet')).toBe('Dört kategori, on hizmet');
    expect(text(c, '{Steps} adım')).toBe('Altı adım');
    expect(text(c, c.home.intro.paragraph)).toContain("Aralık 2020'de kuruldu.");
  });

  it('matches every project', () => {
    expect(c.projects.map((p) => p.slug)).toEqual(oldProjects.map((p) => p.slug));
    c.projects.forEach((p, i) => {
      const old = oldProjects[i];
      expect(p.published).toBe(true);
      expect(p.concept).toBe(old.status === 'concept');
      expect(p.title).toBe(old.title);
      expect(c.projectCategories.find((x) => x.id === p.categoryId)?.name).toBe(old.category);
      expect(p.kind).toBe(old.kind);
      expect(
        p.scope.map((id) => c.serviceCategories.flatMap((cat) => cat.services).find((s) => s.id === id)?.name),
      ).toEqual(old.scope);
      expect(p.summary).toBe(old.summary);
      expect(p.narrative).toEqual(old.narrative);
      expect(p.materials).toEqual(old.materials);
      expect(p.notes.map((n) => ({ t: n.title, d: n.text }))).toEqual(old.notes);
      expect(resolveImage(c, p.cover)).toEqual(old.cover);
      expect(resolveImage(c, p.hero)).toEqual(old.hero);
      expect(p.gallery.map((g) => ({ ...resolveImage(c, g.image), slot: g.slot, caption: captionOf(c, g) }))).toEqual(
        old.gallery,
      );
      expect(p.video).toBeUndefined();
      expect(old.video).toBeUndefined();
      if (old.beforeAfter) {
        expect(resolveImage(c, p.beforeAfter!.before)).toEqual(old.beforeAfter.before);
        expect(resolveImage(c, p.beforeAfter!.after)).toEqual(old.beforeAfter.after);
      } else expect(p.beforeAfter).toBeUndefined();
    });
  });

  it('keeps the gallery note of the first project and no other', () => {
    expect(c.projects.map((p) => p.galleryNote)).toEqual([
      'Avlu, evin kütlesine açılmış bir oda: ışık önce oraya giriyor.',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('matches project lookup and ordering', () => {
    for (const p of oldProjects) {
      expect(getProject(p.slug)?.slug).toBe(p.slug);
      expect(nextProject(c, p.slug)?.slug).toBe(oldNext(p.slug).slug);
    }
  });

  it('places the home featured slots in layout order', () => {
    expect(c.home.featured.slots.map((s) => s.projectId)).toEqual([
      'avlulu-konut',
      'daire-yenileme',
      'kose-kafe',
      'yamac-evi',
    ]);
  });
});
