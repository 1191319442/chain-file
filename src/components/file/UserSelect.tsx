
import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User } from '@/api/authService';

interface UserSelectProps {
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
}

const UserSelect: React.FC<UserSelectProps> = ({
  selectedUsers,
  onSelectionChange
}) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // 从API获取用户列表
    const fetchUsers = async () => {
      try {
        // 这里需要实现获取用户列表的API
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">选择共享用户</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            选择用户
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="搜索用户..." />
            <CommandEmpty>未找到用户</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    const newSelection = selectedUsers.includes(user.id)
                      ? selectedUsers.filter(id => id !== user.id)
                      : [...selectedUsers, user.id];
                    onSelectionChange(newSelection);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUsers.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.username || user.email}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedUsers.map(userId => {
          const user = users.find(u => u.id === userId);
          return (
            <Badge
              key={userId}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {user?.username || user?.email || userId}
              <button
                onClick={() => {
                  onSelectionChange(selectedUsers.filter(id => id !== userId));
                }}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default UserSelect;
