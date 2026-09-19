GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirements TO authenticated;
GRANT ALL ON public.requirements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trucks TO authenticated;
GRANT ALL ON public.trucks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.truck_visits TO authenticated;
GRANT ALL ON public.truck_visits TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT EXECUTE ON FUNCTION public.match_requirement(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_delivered(uuid) TO authenticated;