import { describe, it, expect } from 'vitest';
import {
  services,
  serviceAreas,
  projects,
  projectImages,
  projectScopes,
  blogPosts,
  testimonials,
  galleryItems,
  contactSubmissions,
  companyInfo,
  showroomInfo,
  aboutSections,
  trustBadges,
  socialLinks,
  faqs,
  serviceTypeEnum,
  contactStatusEnum,
  socialPlatformEnum,
  galleryCategoryEnum,
} from '@/lib/db/schema';

describe('Database Schema', () => {
  describe('Enums', () => {
    it('should have correct service types', () => {
      const enumValues = serviceTypeEnum.enumValues;
      expect(enumValues).toContain('kitchen');
      expect(enumValues).toContain('bathroom');
      expect(enumValues).toContain('whole-house');
      expect(enumValues).toContain('basement');
      expect(enumValues).toContain('cabinet');
      expect(enumValues).toContain('commercial');
      expect(enumValues).toHaveLength(6);
    });

    it('should have correct contact statuses', () => {
      const enumValues = contactStatusEnum.enumValues;
      expect(enumValues).toContain('new');
      expect(enumValues).toContain('contacted');
      expect(enumValues).toContain('converted');
      expect(enumValues).toContain('rejected');
      expect(enumValues).toHaveLength(4);
    });

    it('should have correct social platforms', () => {
      const enumValues = socialPlatformEnum.enumValues;
      expect(enumValues).toContain('facebook');
      expect(enumValues).toContain('instagram');
      expect(enumValues).toContain('youtube');
      expect(enumValues).toContain('linkedin');
      expect(enumValues).toContain('twitter');
      expect(enumValues).toContain('xiaohongshu');
      expect(enumValues).toContain('wechat');
      expect(enumValues).toContain('whatsapp');
      expect(enumValues).toHaveLength(8);
    });

    it('should have correct gallery categories', () => {
      const enumValues = galleryCategoryEnum.enumValues;
      expect(enumValues).toContain('kitchen');
      expect(enumValues).toContain('bathroom');
      expect(enumValues).toContain('whole-house');
      expect(enumValues).toContain('commercial');
      expect(enumValues).toHaveLength(4);
    });
  });

  describe('Services Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(services);
      expect(columns).toContain('id');
      expect(columns).toContain('slug');
      expect(columns).toContain('titleEn');
      expect(columns).toContain('titleZh');
      expect(columns).toContain('descriptionEn');
      expect(columns).toContain('descriptionZh');
      expect(columns).toContain('displayOrder');
    });
  });

  describe('Service Areas Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(serviceAreas);
      expect(columns).toContain('id');
      expect(columns).toContain('slug');
      expect(columns).toContain('nameEn');
      expect(columns).toContain('nameZh');
      expect(columns).toContain('isActive');
    });
  });

  describe('Projects Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(projects);
      expect(columns).toContain('id');
      expect(columns).toContain('slug');
      expect(columns).toContain('titleEn');
      expect(columns).toContain('titleZh');
      expect(columns).toContain('descriptionEn');
      expect(columns).toContain('descriptionZh');
      expect(columns).toContain('serviceType');
      expect(columns).toContain('featured');
      expect(columns).toContain('isPublished');
    });

    it('should have i18n fields', () => {
      const columns = Object.keys(projects);
      const i18nFields = [
        'titleEn',
        'titleZh',
        'descriptionEn',
        'descriptionZh',
        'excerptEn',
        'excerptZh',
        'projectStoryEn',
        'projectStoryZh',
        'categoryEn',
        'categoryZh',
        'durationEn',
        'durationZh',
        'spaceTypeEn',
        'spaceTypeZh',
        'challengeEn',
        'challengeZh',
        'solutionEn',
        'solutionZh',
        'badgeEn',
        'badgeZh',
      ];
      i18nFields.forEach((field) => {
        expect(columns).toContain(field);
      });
    });
  });

  describe('Project Images Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(projectImages);
      expect(columns).toContain('id');
      expect(columns).toContain('projectId');
      expect(columns).toContain('imageUrl');
      expect(columns).toContain('isBefore');
      expect(columns).toContain('displayOrder');
    });
  });

  describe('Project Scopes Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(projectScopes);
      expect(columns).toContain('id');
      expect(columns).toContain('projectId');
      expect(columns).toContain('scopeEn');
      expect(columns).toContain('scopeZh');
    });
  });

  describe('Blog Posts Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(blogPosts);
      expect(columns).toContain('id');
      expect(columns).toContain('slug');
      expect(columns).toContain('titleEn');
      expect(columns).toContain('titleZh');
      expect(columns).toContain('contentEn');
      expect(columns).toContain('contentZh');
      expect(columns).toContain('isPublished');
      expect(columns).toContain('publishedAt');
    });
  });

  describe('Testimonials Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(testimonials);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('textEn');
      expect(columns).toContain('textZh');
      expect(columns).toContain('rating');
      expect(columns).toContain('isFeatured');
    });
  });

  describe('Gallery Items Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(galleryItems);
      expect(columns).toContain('id');
      expect(columns).toContain('imageUrl');
      expect(columns).toContain('category');
      expect(columns).toContain('isPublished');
    });
  });

  describe('Contact Submissions Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(contactSubmissions);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('email');
      expect(columns).toContain('message');
      expect(columns).toContain('status');
    });
  });

  describe('Company Info Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(companyInfo);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('phone');
      expect(columns).toContain('email');
    });
  });

  describe('Showroom Info Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(showroomInfo);
      expect(columns).toContain('id');
      expect(columns).toContain('address');
      expect(columns).toContain('appointmentTextEn');
      expect(columns).toContain('appointmentTextZh');
    });
  });

  describe('About Sections Table', () => {
    it('should have i18n fields', () => {
      const columns = Object.keys(aboutSections);
      expect(columns).toContain('ourJourneyEn');
      expect(columns).toContain('ourJourneyZh');
      expect(columns).toContain('whatWeOfferEn');
      expect(columns).toContain('whatWeOfferZh');
    });
  });

  describe('Trust Badges Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(trustBadges);
      expect(columns).toContain('id');
      expect(columns).toContain('badgeEn');
      expect(columns).toContain('badgeZh');
      expect(columns).toContain('isActive');
    });
  });

  describe('Social Links Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(socialLinks);
      expect(columns).toContain('id');
      expect(columns).toContain('platform');
      expect(columns).toContain('url');
      expect(columns).toContain('isActive');
    });
  });

  describe('FAQs Table', () => {
    it('should have required columns', () => {
      const columns = Object.keys(faqs);
      expect(columns).toContain('id');
      expect(columns).toContain('questionEn');
      expect(columns).toContain('questionZh');
      expect(columns).toContain('answerEn');
      expect(columns).toContain('answerZh');
      expect(columns).toContain('displayOrder');
      expect(columns).toContain('isActive');
    });

    it('should have i18n fields for question and answer', () => {
      const columns = Object.keys(faqs);
      const i18nFields = ['questionEn', 'questionZh', 'answerEn', 'answerZh'];
      i18nFields.forEach((field) => {
        expect(columns).toContain(field);
      });
    });

    it('should have timestamp columns', () => {
      const columns = Object.keys(faqs);
      expect(columns).toContain('createdAt');
      expect(columns).toContain('updatedAt');
    });
  });
});
