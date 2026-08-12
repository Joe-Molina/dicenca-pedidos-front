import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { UserProps } from "../types/types";

// Petición para obtener todos los usuarios del sistema
const getAllUsers = async (): Promise<UserProps[]> => {
  const data = (await api.get("/user/all")).data;
  return data;
};

// Petición para registrar un usuario nuevo (Admin o Vendedor)
const createUser = async (
  newUser: Omit<UserProps, "id">
): Promise<UserProps> => {
  // Elegimos el endpoint según el rol seleccionado
  const endpoint =
    newUser.role === "admin" ? "/user/create/admin" : "/user/create/seller";
  const data = (await api.post(endpoint, newUser)).data;
  return data;
};

// Petición para editar los datos de un usuario
const editUser = async (
  updatedUser: Partial<UserProps>
): Promise<UserProps> => {
  const data = (
    await api.patch(`/user/edit/${updatedUser.id}`, { updatedSeller: updatedUser })
  ).data;
  return data;
};

// Petición para eliminar un usuario
const deleteUser = async (id: number): Promise<UserProps> => {
  const data = (await api.delete(`/user/delete/${id}`)).data;
  return data;
};

export function useUsersQuery() {
  const queryClient = useQueryClient();

  // Consulta general de usuarios
  const query = useQuery<UserProps[]>({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  // Mutación para crear usuarios
  const createUserMutation = useMutation<
    UserProps,
    Error,
    Omit<UserProps, "id">
  >({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidamos "users" para la lista de usuarios y "sellers" por si el usuario es vendedor
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  // Mutación para eliminar usuarios
  const deleteUserMutation = useMutation<UserProps, Error, number>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  // Mutación para editar usuarios
  const editUserMutation = useMutation<UserProps, Error, Partial<UserProps>>({
    mutationFn: editUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  return {
    query,
    createUserMutation,
    deleteUserMutation,
    editUserMutation,
  };
}
