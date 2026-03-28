import { Input } from '@gitroom/react/form/input';
import { FC, useCallback, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { setCookie } from '@gitroom/frontend/components/layout/layout.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { Button } from '@gitroom/react/form/button';
import { ImportDebugPostModal } from '@gitroom/frontend/components/launches/import-debug-post.modal';

const colorOptions = [
  { value: 'INFO', label: 'Info (Blue)', className: 'bg-blue-600' },
  { value: 'WARNING', label: 'Warning (Amber)', className: 'bg-amber-600' },
  { value: 'ERROR', label: 'Error (Red)', className: 'bg-red-600' },
];

const AddAnnouncementModal: FC<{ close: () => void }> = ({ close }) => {
  const fetch = useFetch();
  const { mutate } = useSWRConfig();
  const t = useT();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('INFO');
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await fetch('/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, description, color }),
      });
      await mutate('/announcements');
      close();
    } finally {
      setSaving(false);
    }
  }, [title, description, color]);

  return (
    <div className="flex flex-col gap-[16px] min-w-[500px]">
      <Input
        label={t('announcement_title', 'Title')}
        name="title"
        disableForm={true}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('announcement_title_placeholder', 'Announcement title')}
      />
      <div className="flex flex-col gap-[6px]">
        <label className="text-[14px]">
          {t('announcement_description', 'Description')}
        </label>
        <textarea
          className="bg-input border border-tableBorder rounded-[8px] p-[10px] text-newTextColor min-h-[120px] outline-none resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t(
            'announcement_description_placeholder',
            'Announcement description'
          )}
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <label className="text-[14px]">
          {t('announcement_color', 'Color')}
        </label>
        <div className="flex gap-[8px]">
          {colorOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => setColor(opt.value)}
              className={`flex-1 text-center py-[8px] rounded-[8px] text-white text-[13px] cursor-pointer transition-opacity ${opt.className} ${
                color === opt.value ? 'opacity-100 ring-2 ring-white' : 'opacity-40'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          loading={saving}
          disabled={!title.trim() || !description.trim()}
          className="rounded-[4px]"
        >
          {t('create_announcement', 'Create Announcement')}
        </Button>
      </div>
    </div>
  );
};

const AddAnnouncement = () => {
  const { openModal } = useModals();
  const t = useT();

  const handleClick = useCallback(() => {
    openModal({
      title: t('add_announcement', 'Add Announcement'),
      children: (close) => <AddAnnouncementModal close={close} />,
    });
  }, []);

  return (
    <div
      className="px-[10px] rounded-[4px] bg-green-700 text-white cursor-pointer whitespace-nowrap"
      onClick={handleClick}
    >
      {t('add_announcement', 'Add Announcement')}
    </div>
  );
};

const ImportDebugPost = () => {
  const { openModal } = useModals();
  const t = useT();

  const handleClick = useCallback(() => {
    openModal({
      title: t('import_debug_post', 'Import Debug Post'),
      children: (close) => <ImportDebugPostModal close={close} />,
    });
  }, []);

  return (
    <div
      className="px-[10px] rounded-[4px] bg-yellow-600 text-white cursor-pointer whitespace-nowrap"
      onClick={handleClick}
    >
      {t('import_debug_post', 'Import Debug Post')}
    </div>
  );
};

export const Impersonate = () => {
  const fetch = useFetch();
  const [name, setName] = useState('');
  const { isSecured } = useVariables();
  const user = useUser();
  const load = useCallback(async () => {
    if (!name) {
      return [];
    }
    const value = await (await fetch(`/user/impersonate?name=${name}`)).json();
    return value;
  }, [name]);
  const stopImpersonating = useCallback(async () => {
    if (!isSecured) {
      setCookie('impersonate', '', -10);
    } else {
      await fetch(`/user/impersonate`, {
        method: 'POST',
        body: JSON.stringify({
          id: '',
        }),
      });
    }
    window.location.reload();
  }, []);
  const t = useT();

  const setUser = useCallback(
    (userId: string) => async () => {
      await fetch(`/user/impersonate`, {
        method: 'POST',
        body: JSON.stringify({
          id: userId,
        }),
      });
      window.location.reload();
    },
    []
  );
  const { data } = useSWR(`/impersonate-${name}`, load, {
    refreshWhenHidden: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    refreshWhenOffline: false,
    revalidateIfStale: false,
    refreshInterval: 0,
  });
  const mapData = useMemo(() => {
    return data?.map(
      (curr: any) => ({
        id: curr.id,
        name: curr.user.name,
        email: curr.user.email,
      }),
      []
    );
  }, [data]);
  return (
    <div>
      <div className="bg-forth h-[52px] flex justify-center items-center border-input border rounded-[8px] text-white">
        <div className="relative flex flex-col w-[600px]">
          <div className="relative z-[1]">
            {user?.impersonate ? (
              <div className="text-center flex justify-center items-center gap-[20px]">
                <div>
                  {t('currently_impersonating', 'Currently Impersonating')}
                </div>
                <div>
                  <div
                    className="px-[10px] rounded-[4px] bg-red-500 text-white cursor-pointer"
                    onClick={stopImpersonating}
                  >
                    X
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-[10px]">
                <div className="flex-1">
                  <Input
                    autoComplete="off"
                    placeholder="Write the user details"
                    name="impersonate"
                    disableForm={true}
                    label=""
                    removeError={true}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <ImportDebugPost />
                <AddAnnouncement />
              </div>
            )}
          </div>
          {!!data?.length && (
            <>
              <div
                className="bg-primary/80 fixed start-0 top-0 w-full h-full z-[998]"
                onClick={() => setName('')}
              />
              <div className="absolute top-[100%] w-full start-0 bg-sixth border border-customColor6 text-textColor z-[999]">
                {mapData?.map((user: any) => (
                  <div
                    onClick={setUser(user.id)}
                    key={user.id}
                    className="p-[10px] border-b border-customColor6 hover:bg-tableBorder cursor-pointer"
                  >
                    {t('user_1', 'user:')}
                    {user.id.split('-').at(-1)} - {user.name} - {user.email}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
