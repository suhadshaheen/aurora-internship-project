import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

// selectCommentsBySectionId is a parameterized (factory) selector whose
// internal filtering logic we don't have visibility into here. We mock it
// as a marker so we can directly control what comments$ receives in tests,
// without depending on the real selector's implementation.
jest.mock('./store/comment.selectors', () => {
  const actual = jest.requireActual('./store/comment.selectors');
  return {
    ...actual,
    selectCommentsBySectionId: jest.fn((sectionId: number) => ({
      __marker: 'commentsBySection',
      sectionId,
    })),
  };
});

import { CommentComponent } from './comment.component';
import { CommentActions } from './store/comment.actions';
import {
  selectCommentLoading,
  selectCommentError,
  selectCommentsBySectionId,
} from './store/comment.selectors';
import { selectCurrentUser, selectUserRole } from '../../../login-page/store/auth.selectors';
import { AuthUser } from '../../../login-page/store/auth.state';
import { IComment } from '../../../../../models/comment.interface';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let store: MockStore;

  const makeUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
    id: 1,
    userHandle: 'Test User',
    email: 'user@example.com',
    role: 'EMPLOYEE',
    ...overrides,
  });

  const makeComment = (overrides: Partial<IComment> = {}): IComment =>
    ({
      id: 1,
      sectionId: 100,
      parentCommentId: null,
      content: 'Some comment',
      createdById: 1,
      createdByName: 'Test User',
      dateCreated: new Date('2024-01-01'),
      ...overrides,
    }) as unknown as IComment;

  // Makes store.select() return `comments` whenever the component asks for
  // selectCommentsBySectionId(sectionId), while every other selector keeps
  // going through the normal MockStore machinery.
  const stubCommentsForSection = (comments: IComment[]) => {
    const originalSelect = store.select.bind(store);
    jest.spyOn(store, 'select').mockImplementation((selector: any, ...rest: any[]) => {
      if (selector && selector.__marker === 'commentsBySection') {
        return of(comments);
      }
      return originalSelect(selector, ...rest);
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [provideMockStore({ initialState: {} })],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectCurrentUser, makeUser());
    store.overrideSelector(selectUserRole, 'EMPLOYEE');
    store.overrideSelector(selectCommentLoading, false);
    store.overrideSelector(selectCommentError, null);

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sectionId', 100);

    stubCommentsForSection([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch CommentActions.loadComments with the sectionId', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(
        CommentActions.loadComments({ sectionId: 100 }),
      );
    });

    it('should request comments for the correct sectionId', () => {
      fixture.detectChanges();

      expect(selectCommentsBySectionId).toHaveBeenCalledWith(100);
    });
  });

  describe('canComment$', () => {
    const cases: Array<[string | null, boolean]> = [
      ['ADMIN', true],
      ['admin', true],
      ['EMPLOYEE', true],
      ['employee', true],
      ['GUEST', false],
      [null, false],
    ];

    it.each(cases)('role=%s should result in canComment=%s', (role, expected) => {
      store.overrideSelector(selectUserRole, role);
      store.refreshState();

      fixture.detectChanges();

      let result: boolean | undefined;
      component.canComment$.subscribe((v) => (result = v));

      expect(result).toBe(expected);
    });
  });

  describe('submitComment()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should NOT dispatch if there is no user', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.newCommentContent = 'hello';

      component.submitComment(null);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should NOT dispatch if content is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.newCommentContent = '   ';

      component.submitComment(makeUser());

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch addComment with trimmed content and parentCommentId=null, then reset the input', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.newCommentContent = '  Hello world  ';

      component.submitComment(makeUser());

      expect(dispatchSpy).toHaveBeenCalledWith(
        CommentActions.addComment({
          sectionId: 100,
          parentCommentId: null,
          content: 'Hello world',
        }),
      );
      expect(component.newCommentContent).toBe('');
    });
  });

  describe('startReply()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should set activeReplyId and reset replyContent', () => {
      component.replyContent = 'leftover text';

      component.startReply(5);

      expect(component.activeReplyId).toBe(5);
      expect(component.replyContent).toBe('');
    });

    it('should toggle activeReplyId off when called again with the same id', () => {
      component.startReply(5);
      component.startReply(5);

      expect(component.activeReplyId).toBeNull();
    });
  });

  describe('submitReply()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should NOT dispatch if there is no user', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.replyContent = 'a reply';

      component.submitReply(null, 3);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should NOT dispatch if content is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.replyContent = '   ';

      component.submitReply(makeUser(), 3);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch addComment with the parentCommentId, then reset reply state', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.replyContent = '  A reply  ';
      component.activeReplyId = 3;

      component.submitReply(makeUser(), 3);

      expect(dispatchSpy).toHaveBeenCalledWith(
        CommentActions.addComment({
          sectionId: 100,
          parentCommentId: 3,
          content: 'A reply',
        }),
      );
      expect(component.replyContent).toBe('');
      expect(component.activeReplyId).toBeNull();
    });
  });

  describe('startEdit() / cancelEdit()', () => {
    beforeEach(() => fixture.detectChanges());

    it('startEdit() should set editingCommentId and editContent from the comment', () => {
      const comment = {
        ...makeComment({ id: 9, content: 'Original content' }),
        replies: [],
        isOwn: true,
        canModify: true,
        authorLabel: 'Test User',
      };

      component.startEdit(comment);

      expect(component.editingCommentId).toBe(9);
      expect(component.editContent).toBe('Original content');
    });

    it('cancelEdit() should reset editingCommentId and editContent', () => {
      component.editingCommentId = 9;
      component.editContent = 'something';

      component.cancelEdit();

      expect(component.editingCommentId).toBeNull();
      expect(component.editContent).toBe('');
    });
  });

  describe('submitEdit()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should NOT dispatch if content is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.editContent = '   ';

      component.submitEdit(9);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch updateComment with trimmed content, then reset edit state', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.editContent = '  Updated content  ';

      component.submitEdit(9);

      expect(dispatchSpy).toHaveBeenCalledWith(
        CommentActions.updateComment({ commentId: 9, content: 'Updated content' }),
      );
      expect(component.editingCommentId).toBeNull();
      expect(component.editContent).toBe('');
    });
  });

  describe('deleteComment()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should dispatch deleteComment with the given id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.deleteComment(9);

      expect(dispatchSpy).toHaveBeenCalledWith(
        CommentActions.deleteComment({ commentId: 9 }),
      );
    });
  });

  describe('comments$ (buildCommentTree)', () => {
    it('should nest replies under their parent comment', (done) => {
      const parent = makeComment({ id: 1, parentCommentId: null });
      const reply = makeComment({ id: 2, parentCommentId: 1, content: 'A reply' });

      stubCommentsForSection([parent, reply]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(1);
        expect(result[0].replies.length).toBe(1);
        expect(result[0].replies[0].id).toBe(2);
        done();
      });
    });

    it('should sort top-level comments by date ascending (oldest first)', (done) => {
      const older = makeComment({ id: 1, dateCreated: new Date('2024-01-01') });
      const newer = makeComment({ id: 2, dateCreated: new Date('2024-06-01') });

      stubCommentsForSection([newer, older]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result.map((c) => c.id)).toEqual([1, 2]);
        done();
      });
    });

    it('should sort replies by date ascending within their parent', (done) => {
      const parent = makeComment({ id: 1 });
      const replyNew = makeComment({
        id: 2,
        parentCommentId: 1,
        dateCreated: new Date('2024-06-01'),
      });
      const replyOld = makeComment({
        id: 3,
        parentCommentId: 1,
        dateCreated: new Date('2024-01-01'),
      });

      stubCommentsForSection([parent, replyNew, replyOld]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result[0].replies.map((r) => r.id)).toEqual([3, 2]);
        done();
      });
    });

    it('should mark isOwn=true and canModify=true for the current user\'s own comment', (done) => {
      store.overrideSelector(selectCurrentUser, makeUser({ id: 7 }));
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();

      const ownComment = makeComment({ id: 1, createdById: 7 });
      stubCommentsForSection([ownComment]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result[0].isOwn).toBe(true);
        expect(result[0].canModify).toBe(true);
        done();
      });
    });

    it('should mark isOwn=false and canModify=false for another user\'s comment when role is EMPLOYEE', (done) => {
      store.overrideSelector(selectCurrentUser, makeUser({ id: 7 }));
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();

      const othersComment = makeComment({ id: 1, createdById: 999 });
      stubCommentsForSection([othersComment]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result[0].isOwn).toBe(false);
        expect(result[0].canModify).toBe(false);
        done();
      });
    });

    it('should mark canModify=true for ADMIN even on comments they do not own', (done) => {
      store.overrideSelector(selectCurrentUser, makeUser({ id: 7 }));
      store.overrideSelector(selectUserRole, 'ADMIN');
      store.refreshState();

      const othersComment = makeComment({ id: 1, createdById: 999 });
      stubCommentsForSection([othersComment]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result[0].isOwn).toBe(false);
        expect(result[0].canModify).toBe(true);
        done();
      });
    });

    it('should set authorLabel from createdByName', (done) => {
      const comment = makeComment({ id: 1, createdByName: 'Jane Doe' });
      stubCommentsForSection([comment]);
      fixture.detectChanges();

      component.comments$.subscribe((result) => {
        expect(result[0].authorLabel).toBe('Jane Doe');
        done();
      });
    });
  });

  describe('template', () => {
    it('should show "No comments yet." when there are no comments', () => {
      stubCommentsForSection([]);
      fixture.detectChanges();

      const emptyEl = fixture.debugElement.query(By.css('.comments-status'));
      expect(emptyEl).toBeTruthy();
      expect(emptyEl.nativeElement.textContent).toContain('No comments yet.');
    });

    it('should show the comment form and hide the guest message when canComment$ is true', () => {
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('.comment-form'));
      const guestMsg = fixture.debugElement.query(By.css('.comments-status--muted'));

      expect(form).toBeTruthy();
      expect(guestMsg).toBeFalsy();
    });

    it('should hide the comment form and show the guest message when canComment$ is false', () => {
      store.overrideSelector(selectUserRole, 'GUEST');
      store.refreshState();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('.comment-form'));
      const guestMsg = fixture.debugElement.query(By.css('.comments-status--muted'));

      expect(form).toBeFalsy();
      expect(guestMsg).toBeTruthy();
      expect(guestMsg.nativeElement.textContent).toContain('Guests cannot post comments.');
    });

    it('should show edit/delete buttons only for comments the user can modify', () => {
      store.overrideSelector(selectCurrentUser, makeUser({ id: 1 }));
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();

      const ownComment = makeComment({ id: 1, createdById: 1 });
      const othersComment = makeComment({ id: 2, createdById: 999 });
      stubCommentsForSection([ownComment, othersComment]);
      fixture.detectChanges();

      const editButtons = fixture.debugElement.queryAll(By.css('.comment-edit-toggle'));
      const deleteButtons = fixture.debugElement.queryAll(By.css('.comment-delete-toggle'));

      expect(editButtons.length).toBe(1);
      expect(deleteButtons.length).toBe(1);
    });

    it('should call deleteComment() with the correct id when delete is clicked', () => {
      store.overrideSelector(selectCurrentUser, makeUser({ id: 1 }));
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();

      const ownComment = makeComment({ id: 42, createdById: 1 });
      stubCommentsForSection([ownComment]);
      fixture.detectChanges();

      const deleteSpy = jest.spyOn(component, 'deleteComment');
      const deleteButton = fixture.debugElement.query(By.css('.comment-delete-toggle'));

      deleteButton.nativeElement.click();

      expect(deleteSpy).toHaveBeenCalledWith(42);
    });
  });
});