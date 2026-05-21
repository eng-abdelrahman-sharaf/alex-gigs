import { Router } from 'express';
import { GigController } from '../controllers/gig.controller';
import { requireAuth, requireFreelancer } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createGigSchema,
  updateGigSchema,
  searchGigSchema,
  addFaqSchema,
  addPackageSchema,
  updatePackageSchema
} from '../schemas/gig.schema';

const router = Router();

// Gig search/indexing & detail routes (Public)
router.get('/', validate(searchGigSchema), GigController.searchGigs);
router.get('/:id(\\d+)', GigController.getGigDetails);

// Saved Gig lists (Buyer context)
router.get('/saved', requireAuth, GigController.getSavedGigs);
router.post('/:id(\\d+)/save', requireAuth, GigController.saveGig);
router.delete('/:id(\\d+)/unsave', requireAuth, GigController.unsaveGig);

// Gig Creation/Modification (Freelancer context)
router.post('/', requireAuth, requireFreelancer, validate(createGigSchema), GigController.createGig);
router.patch('/:id(\\d+)', requireAuth, requireFreelancer, validate(updateGigSchema), GigController.updateGig);
router.delete('/:id(\\d+)', requireAuth, requireFreelancer, GigController.deleteGig);

// FAQs Management
router.post('/:id(\\d+)/faqs', requireAuth, requireFreelancer, validate(addFaqSchema), GigController.addFaq);
router.delete('/:id(\\d+)/faqs', requireAuth, requireFreelancer, GigController.deleteFaq);

// Packages Management
router.post('/:id(\\d+)/packages', requireAuth, requireFreelancer, validate(addPackageSchema), GigController.addPackage);
router.patch('/packages/:packageId(\\d+)', requireAuth, requireFreelancer, validate(updatePackageSchema), GigController.updatePackage);

export default router;
