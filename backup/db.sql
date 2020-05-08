CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;

ALTER FUNCTION public.set_current_timestamp_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.role (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);

ALTER TABLE public.role OWNER TO postgres;

ALTER TABLE ONLY public.role
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

CREATE TABLE public.auth (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    username text,
    provider text DEFAULT 'local'::text NOT NULL,
    photo_url text,
    disabled boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    salt text NOT NULL,
    refresh_token text,
    email_verification_code character varying,
    email_verification_expiration integer,
    reset_password_code character varying,
    reset_password_expiration integer,
    social_id text
);

ALTER TABLE public.auth OWNER TO postgres;

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_email_key UNIQUE (email);

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_username_key UNIQUE (username);

CREATE TRIGGER set_public_auth_updated_at BEFORE UPDATE ON public.auth FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

COMMENT ON TRIGGER set_public_auth_updated_at ON public.auth IS 'trigger to set value of column "updated_at" to current timestamp on row update';

CREATE TABLE public.auth_role (
    auth_id uuid NOT NULL,
    role_id uuid NOT NULL
);

ALTER TABLE public.auth_role OWNER TO postgres;

ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_role_pkey PRIMARY KEY (auth_id, role_id);

ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_role_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES public.auth(id) ON UPDATE RESTRICT ON DELETE CASCADE;

ALTER TABLE ONLY public.auth_role
    ADD CONSTRAINT auth_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id) ON UPDATE RESTRICT ON DELETE CASCADE;

INSERT INTO public.role VALUES ('98d4bce1-b51a-4c6f-98a8-96fd24d06e1b', 'user');
INSERT INTO public.role VALUES ('9c2597ad-7955-4dc9-85eb-d6ef203afd2c', 'uadmin');
INSERT INTO public.auth 
(id, email, password, email_verified, username, provider, photo_url, disabled, last_login_at, created_at, updated_at, salt, refresh_token, email_verification_code, email_verification_expiration, reset_password_code, reset_password_expiration, social_id)
VALUES 
('e6deebe2-87da-4a85-ac58-67fd2731113c', 'lvizcaya@arpixnet.com', '17daaa4e305a2e059245b92251ad975e1a8e8e941426fc6dc40fe5ecf1caf1ef5f2d0baae10084df40e39164389e53f47b6a1a9870c66492530074ad1c6b5b91', true, null, 'local', null, false,	'2020-05-07 19:50:55+00', '2020-05-04 03:30:17.211019+00', '2020-05-07 19:50:55.046+00', '08ced1dd8327580e754490223c52b8869ef3cd4613f729cea5f49570e304b3ec', '$2b$10$qZsL1jEYOpvWEOV7E8hhVO8iR5A5fCD9TEgIk.9daAbAn0HFFPJ4e', null, null, null, null, null);
INSERT INTO public.auth_role 
VALUES ('e6deebe2-87da-4a85-ac58-67fd2731113c', '98d4bce1-b51a-4c6f-98a8-96fd24d06e1b');
